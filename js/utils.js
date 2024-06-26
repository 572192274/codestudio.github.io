const utils = {
    debounce: function (func, wait, immediate) {
        let timeout
        return function () {
            const context = this
            const args = arguments
            const later = function () {
                timeout = null
                if (!immediate) func.apply(context, args)
            }
            const callNow = immediate && !timeout
            clearTimeout(timeout)
            timeout = setTimeout(later, wait)
            if (callNow) func.apply(context, args)
        }
    },

    throttle: function (func, wait, options) {
        let timeout, context, args
        let previous = 0
        if (!options) options = {}

        const later = function () {
            previous = options.leading === false ? 0 : new Date().getTime()
            func.apply(context, args)
            context = args = null
        }

        return function () {
            const now = new Date().getTime()
            if (!previous && options.leading === false) previous = now
            const remaining = wait - (now - previous)
            context = this
            args = arguments
            if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                    clearTimeout(timeout)
                    timeout = null
                }
                previous = now
                func.apply(context, args)
                if (!timeout) context = args = null
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining)
            }
        }
    },

    fadeIn: (ele, time) => {
        ele.style.cssText = `display:block;animation: to_show ${time}s`
    },

    fadeOut: (ele, time) => {
        ele.addEventListener('animationend', function f() {
            ele.style.cssText = "display: none; animation: '' "
            ele.removeEventListener('animationend', f)
        })
        ele.style.animation = `to_hide ${time}s`
    },

    sidebarPaddingR: () => {
        const innerWidth = window.innerWidth
        const clientWidth = document.body.clientWidth
        const paddingRight = innerWidth - clientWidth
        if (innerWidth !== clientWidth) {
            document.body.style.paddingRight = paddingRight + 'px'
        }
    },

    snackbarShow: (text, showAction, duration) => {
        const sa = (typeof showAction !== 'undefined') ? showAction : false
        const dur = (typeof duration !== 'undefined') ? duration : 5000
        document.styleSheets[0].addRule(':root', '--efu-snackbar-time:' + dur + 'ms!important')
        Snackbar.show({
            text: text,
            showAction: sa,
            duration: dur,
            pos: 'top-center'
        })
    },

    copy: async (text) => {
        try {
            await navigator.clipboard.writeText(text)
            utils.snackbarShow(GLOBAL_CONFIG.lang.copy.success, false, 2000)
        } catch (err) {
            utils.snackbarShow(GLOBAL_CONFIG.lang.copy.error, false, 2000)
        }
    },

    getEleTop: ele => {
        let actualTop = 0
        while (ele) {
            actualTop += ele.offsetTop
            ele = ele.offsetParent
        }
        return actualTop
    },

    randomNum: (length) => {
        return Math.floor(Math.random() * length)
    },

    timeDiff: (timeObj, today) => {
        const timeDiff = today.getTime() - timeObj.getTime();
        return Math.floor(timeDiff / (1000 * 3600 * 24));
    },

    scrollToDest: (pos, time = 500) => {
        const currentPos = window.pageYOffset
        const isNavFixed = document.getElementById('page-header').classList.contains('nav-fixed')
        if (currentPos > pos || isNavFixed) pos = pos - 70
        if ('scrollBehavior' in document.documentElement.style) {
            window.scrollTo({
                top: pos,
                behavior: 'smooth'
            })
            return
        }
        let start = null
        const distance = pos - currentPos
        window.requestAnimationFrame(function step(currentTime) {
            start = !start ? currentTime : start
            const progress = currentTime - start
            if (progress < time) {
                window.scrollTo(0, currentPos + distance * progress / time)
                window.requestAnimationFrame(step)
            } else {
                window.scrollTo(0, pos)
            }
        })
    },
    siblings: (ele, selector) => {
        return [...ele.parentNode.children].filter((child) => {
            if (selector) {
                return child !== ele && child.matches(selector)
            }
            return child !== ele
        })
    },
    isMobile: () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isHidden: e => 0 === e.offsetHeight && 0 === e.offsetWidth,
    addEventListenerPjax: (ele, event, fn, option = false) => {
        ele.addEventListener(event, fn, option)
        utils.addGlobalFn('pjax', () => {
            ele.removeEventListener(event, fn, option)
        })
    },
    addGlobalFn: (key, fn, name = false, parent = window) => {
        const globalFn = parent.globalFn || {}
        const keyObj = globalFn[key] || {}

        if (name && keyObj[name]) return

        name = name || Object.keys(keyObj).length
        keyObj[name] = fn
        globalFn[key] = keyObj
        parent.globalFn = globalFn
    },
    animateIn: (ele, text) => {
        ele.style.display = 'block'
        ele.style.animation = text
    },
    animateOut: (ele, text) => {
        ele.addEventListener('animationend', function f() {
            ele.style.display = ''
            ele.style.animation = ''
            ele.removeEventListener('animationend', f)
        })
        ele.style.animation = text
    },
    wrap: (selector, eleType, options) => {
        const createEle = document.createElement(eleType)
        for (const [key, value] of Object.entries(options)) {
            createEle.setAttribute(key, value)
        }
        selector.parentNode.insertBefore(createEle, selector)
        createEle.appendChild(selector)
    },
    lazyloadImg: function () {
        window.lazyLoadInstance = new LazyLoad({
            elements_selector: 'img',
            threshold: 0,
            data_src: 'lazy-src',
            callback_error: (img) => {
                img.setAttribute("src", GLOBAL_CONFIG.lazyload.error);
            }
        })
    },
    lightbox: function (selector) {
        const lightbox = GLOBAL_CONFIG.lightbox

        if (lightbox === 'mediumZoom' && mediumZoom) {
            mediumZoom(selector, {
                background: "var(--efu-card-bg)"
            });
        }

        if (lightbox === 'fancybox') {
            selector.forEach(i => {
                if (i.parentNode.tagName !== 'A') {
                    const dataSrc = i.dataset.lazySrc || i.src
                    const dataCaption = i.title || i.alt || ''
                    utils.wrap(i, 'a', {
                        class: 'fancybox',
                        href: dataSrc,
                        'data-fancybox': 'gallery',
                        'data-caption': dataCaption,
                        'data-thumb': dataSrc
                    })
                }
            })

            if (!window.fancyboxRun) {
                Fancybox.bind('[data-fancybox]', {
                    Hash: false,
                    Thumbs: {
                        showOnStart: false
                    },
                    Images: {
                        Panzoom: {
                            maxScale: 4
                        }
                    },
                    Carousel: {
                        transition: 'slide'
                    },
                    Toolbar: {
                        display: {
                            left: ['infobar'],
                            middle: ['zoomIn', 'zoomOut', 'toggle1to1', 'rotateCCW', 'rotateCW', 'flipX', 'flipY'],
                            right: ['slideshow', 'thumbs', 'close']
                        }
                    }
                })
                window.fancyboxRun = true
            }
        }
    },
    diffDate: (d, more = false) => {
        const dateNow = new Date()
        const datePost = new Date(d)
        const dateDiff = dateNow.getTime() - datePost.getTime()
        const minute = 1000 * 60
        const hour = minute * 60
        const day = hour * 24
        const month = day * 30
        const {
            time
        } = GLOBAL_CONFIG.lang

        if (!more) return parseInt(dateDiff / day)

        const monthCount = dateDiff / month
        const dayCount = dateDiff / day
        const hourCount = dateDiff / hour
        const minuteCount = dateDiff / minute

        if (monthCount > 12) return datePost.toISOString().slice(0, 10)
        if (monthCount >= 1) return `${parseInt(monthCount)} ${time.month}`
        if (dayCount >= 1) return `${parseInt(dayCount)} ${time.day}`
        if (hourCount >= 1) return `${parseInt(hourCount)} ${time.hour}`
        if (minuteCount >= 1) return `${parseInt(minuteCount)} ${time.min}`
        return time.just
    },
    loadComment: (dom, callback) => {
        if ('IntersectionObserver' in window) {
            const observerItem = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    callback()
                    observerItem.disconnect()
                }
            }, {
                threshold: [0]
            })
            observerItem.observe(dom)
        } else {
            callback()
        }
    },
}