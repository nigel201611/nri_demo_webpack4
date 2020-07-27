<!--
 * @Author: nigel
 * @Date: 2020-06-23 10:11:53
 * @LastEditTime: 2020-07-23 16:16:30
--> 
<i18n src="./locals/index.json"></i18n>
<template>
  <div class="carousel-wrap">
    <el-carousel
      ref="product_carousel"
      arrow="always"
      :autoplay="false"
      type="card"
      :initial-index="0"
      height="280px"
      @change="handleChangeCarousel"
    >
      <el-carousel-item
        v-for="(item,index) in imgArr"
        :key="index"
        class="carousel_item"
        :name="item.url"
      >
        <img :src="item.url" alt />
        <div v-if="isConfirm && curIndex==index" class="product_detail">
          <p class="header">Product Name</p>
          <img src="/static/images/scancode.png" alt="Product purchase QR code" />
          <p class="footer">Stock: 110</p>
        </div>
      </el-carousel-item>
    </el-carousel>

    <div class="gesture_icon">
      <i :class="[iconfontClass, gestureLeft,curGesture=='left'?'active':'']">
        <span>Prev</span>
      </i>
      <i :class="[iconfontClass, gestureCancel, curGesture=='stop'?'active':'']">
        <span>Cancel</span>
      </i>
      <i :class="[iconfontClass, gestureHome, curGesture=='punch'?'active':'']">
        <span>Home</span>
      </i>
      <i :class="[iconfontClass, gestureConfirm, curGesture=='thumbs_up'?'active':'']">
        <span>Confirm</span>
      </i>
      <i :class="[iconfontClass, gestureRight, curGesture=='right'?'active':'']">
        <span>Next</span>
      </i>
    </div>
  </div>
</template>

<script>
const imgArrOrigin = [
  {
    url: "/static/images/ocr_common01.jpg",
    price: "121.12",
    name: "商品1",
    stock: "120",
  },
  {
    url: "/static/images/ocr_common02.jpg",
    price: "121.12",
    name: "商品2",
    stock: "120",
  },
  {
    url: "/static/images/ocr_common07.jpg",
    price: "121.12",
    name: "商品3",
    stock: "120",
  },
  {
    url: "/static/images/ocr_common08.jpg",
    price: "121.12",
    name: "商品4",
    stock: "120",
  },
  {
    url: "/static/images/ocr_common05.jpg",
    price: "121.12",
    name: "商品5",
    stock: "120",
  },
  {
    url: "/static/images/ocr_common06.jpg",
    price: "121.12",
    name: "商品6",
    stock: "120",
  },
];
import { mapState } from "vuex";
// import _ from "lodash";
// import api from "../../api";
export default {
  data() {
    return {
      iconfontClass: "iconfont ",
      gestureLeft: "icon-gesture_left",
      gestureRight: "icon-gesture_right",
      gestureCancel: "icon-gesture_cancel",
      gestureHome: "icon-gesture_home",
      gestureConfirm: "icon-gesture_confirm confirm",
      isRequesting: false, //控制请求次数和加载状态
      imgArr: imgArrOrigin, //产品信息
      curIndex: 0, //当前走马灯索引
      curGesture: "", //默认就是拳头
      prevGesture: "no", //记录上一次接收到的手势，默认no
      isConfirm: false, //控制显示产品信息，用户确认手势显示产品信息
    };
  },
  computed: {
    ...mapState({
      locals: (state) => state.menuStore.locals,
    }),
  },
  watch: {
    locals(val) {
      this.$i18n.locale = val;
    },
  },
  mounted() {
    this.callGestrue();
  },
  destroyed() {},
  methods: {
    prev() {
      this.$refs.product_carousel.prev();
    },
    next() {
      this.$refs.product_carousel.next();
    },
    handleChangeCarousel(value) {
      this.curIndex = value;
    },
    /**
     * @desc 函数节流
     * @param func 函数
     * @param wait 延迟执行毫秒数
     * @param type 1 表时间戳版，2 表定时器版
     */
    throttle(func, wait, type) {
      let previous = 0;
      let timeout;
      // if (type === 1) {
      //   let previous = 0;
      // } else if (type === 2) {
      //   let timeout;
      // }
      return function () {
        let context = this;
        let args = arguments;
        if (type === 1) {
          let now = Date.now();
          if (now - previous > wait) {
            func.apply(context, args);
            previous = now;
          }
        } else if (type === 2) {
          if (!timeout) {
            timeout = setTimeout(() => {
              timeout = null;
              func.apply(context, args);
            }, wait);
          }
        }
      };
    },
    handleBannerSwift(gesture) {
      //如果不同，记录下当前手势到preGestrue,为下次做准备
      this.prevGesture = gesture;
      switch (gesture) {
        case "stop":
          //取消手势，隐藏产品显示信息
          // console.log("cancel");
          this.isConfirm = false;
          break;
        case "punch":
          //取消手势
          // console.log("return home or init to the first product");
          this.$refs.product_carousel.setActiveItem(0);
          break;
        case "left":
          //取消手势
          // console.log("prev product");
          this.prev();
          break;
        case "right":
          // console.log("next product");
          this.next();
          break;
        case "thumbs_up":
          //取消手势
          // console.log("confirm");
          this.isConfirm = true;
          //显示产品的名称，库存，二维码
          break;
      }
    },
    callGestrue() {
      let socket = io("http://127.0.0.1:8094");
      socket.on("opend", function (data) {
        console.log("opend:", data);
      });
      socket.on("pythonMessageFromNode", (data) => {
        this.isConfirm = false;
        if (data.code == "0") {
          //对于相同的手势实现节流，保证1s切换一次（1s内有三个向左手势和一个向右手势，那么只触发向左一次和向右一次）
          //如果本次手势和上次手势不一样，那么不走节流，直接触发
          let gesture = data.result;
          this.curGesture = gesture;
          console.log(
            this.prevGesture,
            this.curGesture,
            this.prevGesture == gesture
          );
          //本次接收到的和上次接收到的一致，那么不做任何动作
          //如果期间收到了no，说明用户有换手势
          if (this.prevGesture == this.curGesture) {
            //相同走节流,目前设置时间600ms
            // _.debounce(this.handleBannerSwift(gesture), 600);
            this.throttle(this.handleBannerSwift(gesture), 2000, 2);
          } else {
            //不相同，马上触发一次
            this.handleBannerSwift(gesture);
          }
        } else {
          console.log(data);
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.carousel-wrap {
  padding: 50px 100px 0 100px;
  .carousel_item {
    display: flex;
    justify-content: center;
    align-items: center;
    img {
      width: 100%;
    }
    .product_detail {
      width: 100%;
      height: 100%;
      background: rgba($color: #222222, $alpha: 0.4);
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      color: #ffffff;
      font-family: Helvetica Neue For Number, -apple-system, BlinkMacSystemFont,
        Segoe UI, Roboto, PingFang SC, Hiragino Sans GB, Microsoft YaHei,
        Helvetica Neue, Helvetica, Arial, sans-serif;
      img {
        // width: 40%;
        width: 180px;
      }
      p {
        margin: 0;
      }
      .header {
        font-size: 18px;
        font-weight: 600;
        line-height: 48px;
      }
      .footer {
        line-height: 30px;
      }
    }
  }
}
.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}
.gesture_icon {
  width: 100%;
  display: flex;
  justify-content: center;
  .iconfont {
    margin: 20px 40px 0 0;
    font-size: 68px;
    display: inline-block;
    color: #99a9bf;
    span {
      font-size: 20px;
    }
  }
  .active {
    color: rgb(32, 160, 255);
    transform: scale(1.5);
  }
  .confirm {
    font-size: 98px;
    position: relative;
    top: -16px;
  }
}
</style>