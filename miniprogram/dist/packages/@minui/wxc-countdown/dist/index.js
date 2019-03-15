export default Component({
  behaviors: [],
  properties: {
    countdown: {
      type: Number,
      value: 0,
      observer: 'init'
    },
    format: {
      type: String,
      value: 'dd天hh时mm分ss秒'
    },
    numStyle: {
      type: String,
      value: ''
    },
    symbolStyle: {
      type: String,
      value: ''
    }
  },
  data: {
    computeTime: 0,
    endTimeMs: 0
  },
  detached() {
    this.onPageHide();
  },
  methods: {
    /**
     * Initialization
     */
    init() {
      let { countdown, format } = this.data;
      // countdown seconds
      this.computeTime = countdown;
      // time format
      this.format = format;

      const now = Date.now();
      // end timestamp (millisecond)
      this.endTimeMs = now + this.computeTime * 1000;

      this.initCountdown();
    },

    /**
     * timer
     */
    initCountdown() {
      clearInterval(this._timer);

      const now = Date.now();
      // countdown milliseconds
      let computeTimeMs = this.endTimeMs - now;
      // countdown interval
      let timeout = computeTimeMs % 1000 || 0;

      this._timer = setTimeout(() => {
        this.initCountdown();
      }, timeout);

      this.setCountdownTimeItems(computeTimeMs);
    },

    /**
     * set countdown seconds
     * @param  {Number} computeTimeMs - Countdown milliseconds
     */
    setCountdownTimeItems(computeTimeMs) {
      this.computeTime = parseInt(Math.ceil(computeTimeMs / 1000));
      this.emitRunCount(this.computeTime);

      if (this.computeTime <= 0) {
        clearInterval(this._timer);
        this.emitEndCount();
      }

      let timeItems = this.getTimeItems(this.computeTime, this.format);
      this.setData({
        timeItems
      });
    },

    /**
     * get rendering data
     * @param  {Number} computeTime - countdown seconds
     * @param  {String} format - time format
     * @return {Array} rendering data
     */
    getTimeItems(computeTime, format) {
      if (computeTime < 0) {
        computeTime = 0;
      }
      let arr = format.match(/[a-zA-Z]{1,3}/g) || [];
      let symbolArr = format.match(/[\u4e00-\u9fa5]+|[^a-zA-Z]/g) || [];
      let time = this.getTime(computeTime, format);
      return arr.map((item, i) => {
        return {
          num: time[item],
          symbol: symbolArr[i]
        };
      });
    },

    /**
     * get countdown object
     * @param  {Number} leftseconds - countdown seconds
     * @param  {String} format - time format
     * @return {Object} separated countdown seconds width d, h, m, s
     */
    getTime(leftseconds, format) {
      let d = leftseconds;
      let [s, m, h] = [60, 60, 24].map(unit => {
        let num = d % unit;
        d = Math.floor(d / unit);
        return num;
      });

      if (leftseconds > 86400 && format.indexOf('d') === -1) {
        h += d * 24;
      }

      if (leftseconds > 3600 && format.indexOf('h') === -1) {
        m += h * 60;
      }

      if (leftseconds > 60 && format.indexOf('m') === -1) {
        s += m * 60;
      }

      return {
        dd: this.formatTime(d),
        hh: this.formatTime(h),
        mm: this.formatTime(m),
        ss: this.formatTime(s),
        d,
        h,
        m,
        s
      };
    },

    /**
     * zero padding
     * @param  {Number} val - number
     * @return {Number|String} the number after zero padding
     */
    formatTime(val) {
      return val < 10 ? `0${val}` : val;
    },

    /**
     * timing callback
     */
    emitRunCount() {
      this.triggerEvent('runcount', {
        computeTime: this.computeTime
      });
    },

    /**
     * end callback
     */
    emitEndCount() {
      this.triggerEvent('endcount');
    },

    onPageShow() {
      const now = Date.now();
      if (this.format && this.endTimeMs) {
        this.computeTime = parseInt((this.endTimeMs - now) / 1000);
        this.initCountdown();
      }
    },

    onPageHide() {
      clearInterval(this._timer);
    }
  }
});