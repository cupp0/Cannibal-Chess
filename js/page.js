class Page{
  constructor(val, callback, callback2, ctx){
    this.state = val
    this.callback = callback
    this.callback2 = callback2
    this.ctx = ctx;
    this.click = false;
  }

  onClick(){
    this.click = true;
    if (this.state === "awaitingClick") {
      this.ctx.clearRect(0,0,300,300); 
      this.callback2();
    }
  }

  setState(val){
    this.state = val;
    if (val === "game"){
      document.body.style.cursor = 'none';
      this.callback();
    }
    if (val === "awaitingClick"){
      if (this.click){
          this.ctx.clearRect(0,0,300,300);    
          this.callback2();
      }
    }
    if (val === "endGameDialog"){
      document.body.style.cursor = 'default';
    }
  }

  reset(){
    this.state = "menu"
  }

}

export default Page;