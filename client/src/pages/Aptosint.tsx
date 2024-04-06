import React, { useEffect, useState } from "react";
import { Aptos } from "@aptos-labs/ts-sdk";
import { useWallet, InputTransactionData } from "@aptos-labs/wallet-adapter-react";

export const aptos = new Aptos();
export const moduleAddress = "0x880bf4602b8bcc1a3587d4e138e91cb9d961e8a081b94ba101ef6a3798516f0b";

type Nft = {
  address: string;
  lease_completed: boolean;
  content: string;
  nft_id: string;
};

function Aptosint() {
  const [accountHasList, setAccountHasList] = useState<boolean>(false);
  const { account, signAndSubmitTransaction } = useWallet();
  const [transactionInProgress, setTransactionInProgress] = useState<boolean>(false);
  const [tasks, setTasks] = useState<Nft[]>([]);
  const [newTask, setNewTask] = useState<string>("");

  const onWriteTask = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setNewTask(value);
  };

  useEffect(() => {
    fetchList();
  }, [account?.address]);

  const fetchList = async () => {
    if (!account) return [];
    try {
      const nftListResource = await aptos.getAccountResource({
        accountAddress: account?.address,
        resourceType: `${moduleAddress}::nft::NftList`
      });
      setAccountHasList(true);
      // tasks table handle
      const tableHandle = nftListResource.tasks.handle;
      // tasks table counter
      const taskCounter = nftListResource.task_counter;

      let tasks = [];
      let counter = 1;
      while (counter <= taskCounter) {
        const tableItem = {
          key_type: "u64",
          value_type: `${moduleAddress}::nft::Nft`,
          key: `${counter}`
        };
        const task = await aptos.getTableItem<Nft>({ handle: tableHandle, data: tableItem });
        tasks.push(task);
        counter++;
      }
      // set tasks in local state
      setTasks(tasks);
    } catch (e: any) {
      setAccountHasList(false);
    }
  };

  const addNewList = async () => {
    if (!account) return [];
    setTransactionInProgress(true);

    const transaction: InputTransactionData = {
      data: {
        function: `${moduleAddress}::nft::create_nft_list`,
        functionArguments: []
      }
    };
    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction(transaction);
      // wait for transaction
      await aptos.waitForTransaction({ transactionHash: response.hash });
      setAccountHasList(true);
    } catch (error: any) {
      setAccountHasList(false);
    } finally {
      setTransactionInProgress(false);
    }
  };

  const onTaskAdded = async () => {
    // check for connected account
    if (!account) return;
    setTransactionInProgress(true);
    const transaction: InputTransactionData = {
      data: {
        function: `${moduleAddress}::nft::create_nft`,
        functionArguments: [newTask]
      }
    };

    // hold the latest task.nft_id from our local state
    const latestId = tasks.length > 0 ? parseInt(tasks[tasks.length - 1].nft_id) + 1 : 1;

    // build a newTaskToPush object into our local state
    const newTaskToPush = {
      address: account.address,
      lease_completed: false,
      content: newTask,
      nft_id: latestId + "",
    };

    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction(transaction);
      // wait for transaction
      await aptos.waitForTransaction({ transactionHash: response.hash });

      // Create a new array based on current state:
      let newTasks = [...tasks];

      // Add item to the tasks array
      newTasks.push(newTaskToPush);
      // Set state
      setTasks(newTasks);
      // clear input text
      setNewTask("");
    } catch (error: any) {
      console.log("error", error);
    } finally {
      setTransactionInProgress(false);
    }
  };

  const completeTask = async (taskId: string) => {
    if (!account) return;
    setTransactionInProgress(true);
    const transaction: InputTransactionData = {
      data: {
        function: `${moduleAddress}::nft::complete_nft`,
        functionArguments: [taskId]
      }
    };

    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction(transaction);
      // wait for transaction
      await aptos.waitForTransaction({ transactionHash: response.hash });

      setTasks((prevState) => {
        const newState = prevState.map((task) => {
          // if nft_id equals the lease_completed taskId, update lease_completed property
          if (task.nft_id === taskId) {
            return { ...task, lease_completed: true };
          }
          return task;
        });
        return newState;
      });
    } catch (error: any) {
      console.log("error", error);
    } finally {
      setTransactionInProgress(false);
    }
  };

  return (
    <>
      {!accountHasList ? (
        <div>
          <button disabled={!account} onClick={addNewList}>
            Add new NFT
          </button>
        </div>
      ) : (
        <div>
          <input
            onChange={(event) => onWriteTask(event)}
            placeholder="Add a Nft"
            value={newTask}
          />
          <button onClick={onTaskAdded}>Mint</button>
          {tasks && (
            <ul>
              {tasks.map((task) => (
                <li key={task.nft_id}>
                  {task.lease_completed ? (
                    <span>{task.content} - lease_completed</span>
                  ) : (
                    <div>
                      {/* <span>{task.content}</span> */}
                      <button onClick={() => completeTask(task.nft_id)}>Complete</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {transactionInProgress && <div>Transaction in progress...</div>}
    </>
  );
}

export default Aptosint;
