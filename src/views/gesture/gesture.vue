<!--
 * @Author: nigel
 * @Date: 2020-06-23 10:11:53
 * @LastEditTime: 2020-06-24 15:45:54
--> 
<i18n src="./locals/index.json"></i18n>
<template>
  <div class="carousel-wrap">
    <el-carousel
      ref="product_carousel"
      :autoplay="false"
      type="card"
      :initial-index="0"
      height="450px"
      @change="handleChangeCarousel"
    >
      <el-carousel-item v-for="(item,index) in imgArr" :key="index" :name="item.url">
        <img :src="item.url" alt />
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<style lang="scss" scoped>
.carousel-wrap {
  padding: 50px 100px 0 100px;
}
.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
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
      isRequesting: false, //控制请求次数和加载状态
      imgArr: imgArrOrigin, //产品信息
      curIndex: 0 //当前走马灯索引
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
      // api.gestureApi.gestrueDetection({}).then(res => {
      //   console.log(res);
      // });

      let socket = io("http://127.0.0.1:8094");  //里面地址到时根据服务器地址改变
      socket.on("opend", function(data) {
        console.log("opend:", data);
      });
    }
  }
};
</script>