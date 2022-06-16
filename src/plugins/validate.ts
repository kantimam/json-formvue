let validate = {
  phone (val: string) {
    return /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/g.test(val);
  },

  email (val: string) {
    return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,4})+$/.test(val);
  }
}

export default validate;
