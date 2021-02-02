function debounce(fn, time) {
    return function(args) {
      let that = this
      clearTimeout(fn.tid)
      fn.tid = setTimeout(() => {
        fn.call(that, args)
      }, time);
    }
  }