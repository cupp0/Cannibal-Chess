class Page{
  constructor(val, callback, callback2){
    this.state = val
    this.callback = callback
    this.callback2 = callback2
    this.click = false;
  }

  onClick(){
    this.click = true;
    if (this.state === "awaitingClick") this.callback2();
  }

  setState(val){
    this.state = val;
    if (val === "game"){
      document.body.style.cursor = 'none';
      this.callback();
    }
    if (val === "awaitingClick"){
      if (this.click) this.callback2();
    }
  }

}

export default Page;