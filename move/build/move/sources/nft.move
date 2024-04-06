module nft_addr::nft {
    use aptos_framework::event;
    use std::string::String;
    #[test_only]
    use std::string;
    use aptos_std::table::{Self,Table};
    use std::signer;
    use aptos_framework::account;

    // Errors
    const E_NOT_INITIALIZED: u64 = 1;
    const ENFT_DOESNT_EXIST: u64 = 2;
    const ENFT_IS_COMPLETED: u64 = 3;

    struct NftList has key {
      nfts: Table<u64, Nft>,
      set_nft_event: event::EventHandle<Nft>,
      nft_counter: u64
    }
  struct Nft has store, drop, copy {
    nft_id: u64,
    address:address,
    content: String,
    lease_completed: bool,
  }
  public entry fun create_nft_list(account: &signer){
  let nft_holder = NftList {
    nfts: table::new(),
    set_nft_event: account::new_event_handle<Nft>(account),
    nft_counter: 0
  };
  move_to(account, nft_holder);
}

public entry fun create_nft(account: &signer, content: String) acquires NftList {
    let signer_address = signer::address_of(account);

    //Checl\k
    assert!(exists<NftList>(signer_address), E_NOT_INITIALIZED);

    let nft_list = borrow_global_mut<NftList>(signer_address);
    let counter = nft_list.nft_counter + 1;
    let new_nft = Nft {
      nft_id: counter,
      address: signer_address,
      content,
      lease_completed: false
    };
    table::upsert(&mut nft_list.nfts, counter, new_nft);
    nft_list.nft_counter = counter;
    event::emit_event<Nft>(
      &mut borrow_global_mut<NftList>(signer_address).set_nft_event,
      new_nft,
    );
  }

  public entry fun complete_nft(account: &signer, nft_id: u64) acquires NftList {
    let signer_address = signer::address_of(account);

    //Check
    assert!(exists<NftList>(signer_address), E_NOT_INITIALIZED);

    let nft_list = borrow_global_mut<NftList>(signer_address);

    //Check
    assert!(table::contains(&nft_list.nfts, nft_id), ENFT_DOESNT_EXIST);

    let nft_record = table::borrow_mut(&mut nft_list.nfts, nft_id);

    //Check
    assert!(nft_record.lease_completed == false, ENFT_IS_COMPLETED);

    nft_record.lease_completed = true;
  }

  #[test(admin = @0x123)]
public entry fun test_flow(admin: signer) acquires NftList {
  // creates an admin @todolist_addr account for test
  account::create_account_for_test(signer::address_of(&admin));
  // initialize contract with admin account
  create_nft_list(&admin);

  // creates a task by the admin account
  create_nft(&admin, string::utf8(b"New NFT"));
  let nft_count = event::counter(&borrow_global<NftList>(signer::address_of(&admin)).set_nft_event);
  assert!(nft_count == 1, 4);
  let nft_list = borrow_global<NftList>(signer::address_of(&admin));
  assert!(nft_list.nft_counter == 1, 5);
  let nft_record = table::borrow(&nft_list.nfts, nft_list.nft_counter);
  assert!(nft_record.nft_id == 1, 6);
  assert!(nft_record.lease_completed == false, 7);
  assert!(nft_record.content == string::utf8(b"New NFT"), 8);
  assert!(nft_record.address == signer::address_of(&admin), 9);

  // updates task as completed
  complete_nft(&admin, 1);
  let nft_list = borrow_global<NftList>(signer::address_of(&admin));
  let nft_record = table::borrow(&nft_list.nfts, 1);
  assert!(nft_record.nft_id == 1, 10);
  assert!(nft_record.lease_completed == true, 11);
  assert!(nft_record.content == string::utf8(b"New NFT"), 12);
  assert!(nft_record.address == signer::address_of(&admin), 13);
}

#[test(admin = @0x123)]
#[expected_failure(abort_code = E_NOT_INITIALIZED)]
public entry fun account_can_not_update_nft(admin: signer) acquires NftList {
  // creates an admin @todolist_addr account for test
  account::create_account_for_test(signer::address_of(&admin));
  // account can not toggle task as no list was created
  complete_nft(&admin, 2);
}

}