<!--
 * @Author: nigel
 * @Date: 2020-06-23 10:11:53
 * @LastEditTime: 2020-07-03 11:14:48
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
  </div>
</template>

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
      font-family: Helvetica Neue For Number, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Helvetica Neue, Helvetica, Arial, sans-serif;
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
<script>
const imgArrOrigin = [
  {
    url: "/static/images/ocr_common01.jpg",
    price: "121.12",
    name: "商品1",
    stock: "120"
  },
  {
    url: "/static/images/ocr_common02.jpg",
    price: "121.12",
    name: "商品2",
    stock: "120"
  },
  {
    url: "/static/images/ocr_common07.jpg",
    price: "121.12",
    name: "商品3",
    stock: "120"
  },
  {
    url: "/static/images/ocr_common08.jpg",
    price: "121.12",
    name: "商品4",
    stock: "120"
  },
  {
    url: "/static/images/ocr_common05.jpg",
    price: "121.12",
    name: "商品5",
    stock: "120"
  },
  {
    url: "/static/images/ocr_common06.jpg",
    price: "121.12",
    name: "商品6",
    stock: "120"
  }
];
import { mapState } from "vuex";
// import api from "../../api";
export default {
  data() {
    return {
      iconfontClass: "iconfont ",
      gestureLeft: "icon-gesture_left",
      gestureRight: "icon-gesture_right",
      gestureCancel: "icon-gesture_cancel",
      gestureHome: "icon-gesture_home",
      gestureConfirm: "icon-gesture_confirm",
      isRequesting: false, //控制请求次数和加载状态
      imgArr: imgArrOrigin, //产品信息
      curIndex: 0, //当前走马灯索引
      curGesture: "", //默认就是拳头
      isConfirm: false //控制显示产品信息，用户确认手势显示产品信息
    };
  },
  computed: {
    ...mapState({
      locals: state => state.menuStore.locals
    })
  },
  watch: {
    locals(val) {
      this.$i18n.locale = val;
    }
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
    callGestrue() {
      let socket = io("http://127.0.0.1:80");
      socket.on("opend", function(data) {
        console.log("opend:", data);
      });
      socket.on("pythonMessageFromNode", data => {
        this.isConfirm = false;
        if (data.code == "0") {
          let gesture = data.result;
          this.curGesture = gesture;
          switch (gesture) {
            case "stop":
              //取消手势，隐藏产品显示信息
              console.log("cancel");
              this.isConfirm = false;
              break;
            case "punch":
              //取消手势
              console.log("return home or init to the first product");
              this.$refs.product_carousel.setActiveItem(0);
              break;
            case "left":
              //取消手势
              console.log("prev product");
              this.prev();
              break;
            case "right":
              console.log("next product");
              this.next();
              break;
            case "thumbs_up":
              //取消手势
              console.log("confirm");
              this.isConfirm = true;
              //显示产品的名称，库存，二维码
              break;
          }
        } else {
          console.log(data);
        }
      });
    }
  }
};
</script>