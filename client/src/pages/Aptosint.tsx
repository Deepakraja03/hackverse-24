import React, { useEffect, useState } from "react";
import { Aptos } from "@aptos-labs/ts-sdk";
import { useWallet, InputTransactionData } from "@aptos-labs/wallet-adapter-react";

export const aptos = new Aptos();
export const moduleAddress = "0x6da8662f79d90b694b882858f2bd37282ac7fd933b61dd8bb2f6d0fd1d46e438";

type Task = {
  address: string;
  completed: boolean;
  content: string;
  task_id: string;
};

function Aptosint() {
  const [accountHasList, setAccountHasList] = useState<boolean>(false);
  const { account, signAndSubmitTransaction } = useWallet();
  const [transactionInProgress, setTransactionInProgress] = useState<boolean>(false);
  const [tasks, setTasks] = useState<Task[]>([]);
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
      const todoListResource = await aptos.getAccountResource({
        accountAddress: account?.address,
        resourceType: `${moduleAddress}::todolist::TodoList`
      });
      setAccountHasList(true);
      // tasks table handle
      const tableHandle = todoListResource.tasks.handle;
      // tasks table counter
      const taskCounter = todoListResource.task_counter;

      let tasks = [];
      let counter = 1;
      while (counter <= taskCounter) {
        const tableItem = {
          key_type: "u64",
          value_type: `${moduleAddress}::todolist::Task`,
          key: `${counter}`
        };
        const task = await aptos.getTableItem<Task>({ handle: tableHandle, data: tableItem });
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
        function: `${moduleAddress}::todolist::create_list`,
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
        function: `${moduleAddress}::todolist::create_task`,
        functionArguments: [newTask]
      }
    };

    // hold the latest task.task_id from our local state
    const latestId = tasks.length > 0 ? parseInt(tasks[tasks.length - 1].task_id) + 1 : 1;

    // build a newTaskToPush object into our local state
    const newTaskToPush = {
      address: account.address,
      completed: false,
      content: newTask,
      task_id: latestId + "",
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
        function: `${moduleAddress}::todolist::complete_task`,
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
          // if task_id equals the completed taskId, update completed property
          if (task.task_id === taskId) {
            return { ...task, completed: true };
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
            Add new list
          </button>
        </div>
      ) : (
        <div>
          <input
            onChange={(event) => onWriteTask(event)}
            placeholder="Add a Task"
            value={newTask}
          />
          <button onClick={onTaskAdded}>Add</button>
          {tasks && (
            <ul>
              {tasks.map((task) => (
                <li key={task.task_id}>
                  {task.completed ? (
                    <span>{task.content} - Completed</span>
                  ) : (
                    <div>
                      <span>{task.content}</span>
                      <button onClick={() => completeTask(task.task_id)}>Complete</button>
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
