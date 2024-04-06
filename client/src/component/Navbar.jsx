import patent from "./patent.jpg";

const Navbar = () => {

  function g(e){
    let list = document.querySelector('ul'); // Define 'list' variable
    if (e.target.name === 'menu') {
      e.target.name = "close";
      list.classList.add('top-[80px]');
      list.classList.add('opacity-100');
    } else {
      e.target.name = "menu";
      list.classList.remove('top-[80px]');
      list.classList.remove('opacity-100');
    }
  }
  
  return (
    <div>
      <meta charset="UTF-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <script type="module" src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js"></script>
      <script nomodule src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js"></script>
      
      <div class="bg-cyan-400">
        <nav class="p-5 bg-white shadow flex justify-between md:flex md:items-center md:justify-between">
          <div class="flex justify-between items-center ">
            <span class="text-2xl font-serif cursor-pointer">
              <img class="h-10 inline" src={patent} alt="patent logo"/>
              PATENT
            </span>
          </div>
      
          <ul class="md:flex md:items-center z-[-1] md:z-auto md:static absolute bg-white w-full left-0 md:w-auto md:py-0 py-4 md:pl-0 pl-7 md:opacity-100 opacity-0 top-[-400px] transition-all ease-in duration-500">
            <li class="mx-4 my-6 md:my-0">
              <a href="#" class="text-xl font-serif hover:text-cyan-500 duration-500">HOME</a>
            </li>
            <li class="mx-4 my-6 md:my-0">
              <a href="#" class="text-xl font-serif hover:text-cyan-500 duration-500">MINT NFT</a>
            </li>
            <li class="mx-4 my-6 md:my-0">
              <a href="#" class="text-xl font-serif hover:text-cyan-500 duration-500">LEASE</a>
            </li>
            <li class="mx-4 my-6 md:my-0">
              <a href="#" class="text-xl font-serif hover:text-cyan-500 duration-500">ABOUT</a>
            </li>
            {/* <WalletSelector/> */}
          </ul>
          <svg className="w-6 h-6 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
        </nav>
      </div>
    </div>
  )
}

export default Navbar;