class Page{
  constructor(val){
    this.state = val
  }

  setState(val){
    this.state = val;
    if (val === "game")document.body.style.cursor = 'none';
  }
}

export default Page;