class Page{
  constructor(val, callback){
    this.state = val
    this.callback = callback
  }

  setState(val){
    this.state = val;
    if (val === "game"){
      document.body.style.cursor = 'none';
      this.callback();
    }
  }
}

export default Page;