document.addEventListener("alpine:init", () => {
  Alpine.magic("scrollY", () => window.scrollY);

  Alpine.magic("pageWidth", () =>
    Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.documentElement.clientWidth
    )
  );

  Alpine.magic("pageHeight", () =>
    Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.documentElement.clientHeight
    )
  );

  Alpine.magic("vh100", () => window.innerHeight);
  Alpine.magic("vh50", () => window.innerHeight / 2);
  Alpine.magic("vh", () => (vh) => (window.innerHeight * vh) / 100);

  Alpine.magic("vw100", () => window.innerWidth);
  Alpine.magic("vw50", () => window.innerWidth / 2);
  Alpine.magic("vw", () => (vw) => (window.innerWidth * vw) / 100);

  Alpine.magic("top", (el) => el.getBoundingClientRect().top);
  Alpine.magic("bottom", (el) => el.getBoundingClientRect().bottom);
  Alpine.magic("left", (el) => el.getBoundingClientRect().left);
  Alpine.magic("right", (el) => el.getBoundingClientRect().right);
  Alpine.magic("height", (el) => el.clientHeight);
  Alpine.magic("width", (el) => el.clientWidth);

  Alpine.magic("isSm", () => window.matchMedia("(max-width: 1023.98px)").matches);
  Alpine.magic("isLg", () => window.matchMedia("(min-width: 1024px)").matches);

  Alpine.magic("px", () => (value) => `${value}px`);

  Alpine.magic("id", () => (id) => document.getElementById(id));
  Alpine.magic("select", () => (selector) => document.querySelector(selector));
  Alpine.magic("selectAll", () => (selector) => document.querySelectorAll(selector));

  Alpine.magic("RO", (el) => (callback) => {
    new ResizeObserver(callback).observe(el);
  });

  Alpine.magic("scrollToMid", (el) => () => {
    window.scrollTo({
      top: el.offsetTop - window.innerHeight / 2 + el.clientHeight / 2,
      behavior: "smooth",
    });
  });

  Alpine.magic("scrollTo", (el) => () => {
    el.scrollIntoView({
      behavior: "smooth",
    });
  });

  Alpine.magic("floaterAnchor", () => (index, { scrollToMid = false, disableScroll = false } = {}) => ({
    "x-on:onload.window"() {
      this.$top <= this.$vh50 && this.$bottom > this.$vh50 && this.$dispatch("floater-index", index);
    },
    "x-on:scroll.window"() {
      this.$top <= this.$vh50 && this.$bottom > this.$vh50 && this.$dispatch("floater-index", index);
    },
    "x-on:float-to.window"() {
      if (disableScroll) return;
      this.$event.detail == index && (scrollToMid ? this.$scrollToMid() : this.$scrollTo());
    },
  }));

  Alpine.magic("lottie", (el) => (path) => {
    bodymovin.loadAnimation({
      container: el, // Required
      path: path, // Required
      renderer: "svg", // Required
      loop: true, // Optional
      autoplay: true, // Optional
    });
  });

  Alpine.magic("share", () => async ({ uid, type }) => {
    if (!uid || !type) return;

    const url = "/_hcms/api/share-points";
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, type }),
      });
      const json = await res.json();

      if (json?.message) {
        this.$dispatch("show-message", json.message);
      }
    } catch (err) {}
  });

  Alpine.data("egg", (opts) => {
    const uid = opts.uid;

    return {
      top: 0,
      left: 0,
      randTop: Math.random(),
      randLeft: Math.random(),
      ready: false,
      chance: Math.random() <= 1 / 7,
      async init() {
        const prefix = "/hubfs/statics/";
        const paths = ["mask/mask-01.json", "mask/mask-02.json", "mask/mask-03.json", "mask/mask-04.json"];
        const index = Math.floor(Math.random() * paths.length);
        this.$lottie(prefix + paths[index]);
        this.update();

        this.ready = await this.getReady();
      },
      root: {
        "x-bind:style"() {
          return {
            top: this.top + "px",
            left: this.left + "px",
            display: this.ready && this.chance ? "block" : "none",
          };
        },
        "x-on:resize.window"() {
          this.update();
        },
        "x-on:click"() {
          this.ready = false;
          this.submit();
        },
      },
      update() {
        const main = document.querySelector("main");
        this.top = Math.floor(this.randTop * (main.clientHeight - this.$height));
        this.left = Math.floor(this.randLeft * (main.clientWidth - this.$width));
      },
      async getReady() {
        if (!uid) return false;
        try {
          const url = `/_hcms/api/easter-egg-info?uid=${uid}`;
          const res = await fetch(url);
          const json = await res.json();
          if ("show_easter_egg" in json?.data) {
            return !!json?.data?.show_easter_egg;
          }
        } catch (err) {
          return false;
        }
      },
      async submit() {
        if (!uid) return;

        const url = "/_hcms/api/find-easter-egg";
        try {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uid }),
          });
          const json = await res.json();
          if (json?.success) {
            this.$dispatch("show-message", "You found me! 2 points for you!");
          } else if (json?.message) {
            this.$dispatch("show-message", json.message);
          }
        } catch (err) {}
      },
    };
  });

  Alpine.data("parallax", () => ({
    innerIsSm: false,
    offset: 0,
    translate: 0,
    init() {
      this.innerIsSm = this.$isSm;
    },
    root: {
      "x-on:scroll.window"() {
        this.update();
      },
      "x-on:resize.window"() {
        this.update();
      },
    },
    update() {
      this.offset = this.$top + this.$height / 2 - this.$vh50;
      this.translate = this.offset / 100;
      this.innerIsSm = this.$isSm;
    },
    animate(intensity, ofst = 0, mofst = 0) {
      return {
        "x-bind:style"() {
          return {
            transform: `translateY(${this.innerIsSm ? mofst : this.translate * intensity + ofst}px)`,
          };
        },
      };
    },
  }));

  const navElem = document.querySelector(".nav");

  if (navElem) {
    new ResizeObserver(([entry]) => {
      document.body.style.setProperty("--nav-height", entry.contentRect.height + "px");
    }).observe(navElem);
  } else {
    document.body.style.setProperty("--nav-height", "0px");
  }
});
