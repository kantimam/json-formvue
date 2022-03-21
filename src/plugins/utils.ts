let utils = {
  disablePageScroll: function () {
    let scrollPosition = window.pageYOffset;
    window.document.body.setAttribute('data-top', String(scrollPosition));
    window.document.body.style.overflow = 'hidden';
    window.document.body.style.position = 'fixed';
    window.document.body.style.top = `-${scrollPosition}px`;
    window.document.body.style.width = '100%';
  },

  elementInViewport: function (el: HTMLElement) {
    let top = el.offsetTop;
    let left = el.offsetLeft;
    let width = el.offsetWidth;
    let height = el.offsetHeight;

    while(el.offsetParent) {
      el = el.offsetParent as HTMLElement;
      top += el.offsetTop;
      left += el.offsetLeft;
    }

    return (
      top < (window.pageYOffset + window.innerHeight) &&
      left < (window.pageXOffset + window.innerWidth) &&
      (top + height) > window.pageYOffset &&
      (left + width) > window.pageXOffset
    );
  },

  enablePageScroll: function () {
    window.document.body.style.removeProperty('overflow');
    window.document.body.style.removeProperty('position');
    window.document.body.style.removeProperty('top');
    window.document.body.style.removeProperty('width');
    const dataTop = window.document.body.getAttribute('data-top');
    window.scrollTo(0, Number(dataTop!));
    window.document.body.removeAttribute('data-top');
  },

  isIOS: function () {
    return ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform) || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  },

  isTouchDevice: function () {
    return (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
  }
}

export default utils;
