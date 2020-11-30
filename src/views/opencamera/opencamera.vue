<i18n src="./locals/index.json"></i18n>
<template>
  <div class="opencamera-wrap">
    <video
      id="video"
      ref="video"
      autoplay="autoplay"
      controls
      :src="src"
      width="1280"
      height="720"
    />
    <canvas
      ref="canvas"
      class="canvas"
      :width="resolvingPowerX"
      :height="resolvingPowerY"
    />
  </div>
</template>

<style lang="scss" scoped>
.opencamera-wrap {
  padding: 20px 0 30px;
}
.canvas {
  position: absolute;
  opacity: 0;
}
</style>
<script>
import api from "../../api";
import { mapState } from "vuex";
// import xmldom from "xmldom"
// import xml2js from 'xml2js';

export default {
  components: {
    // 定义组件
  },
  data() {
    // 选项 数据
    return {
      src: null,
      resolvingPowerX: 3840,
      resolvingPowerY: 2160,
    };
  },

  created() {
    this.imgWidth = 1280;
    this.imgHeight = 720;
    this.interval = 1000 * 60 * 30;
    this.isRequesting = false;
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
    this.video = this.$refs.video;
    this.canvas = this.$refs.canvas;

    //开启摄像头
    if (
      navigator.mediaDevices.getUserMedia ||
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia
    ) {
      this.getUserMedia(
        {
          video: {
            width: { ideal: this.resolvingPowerX },
            height: { ideal: this.resolvingPowerY },
          },
        },
        this.success,
        this.error
      );
    } else {
      this.$notify({
        title: this.$t("warning-text"),
        type: "warning",
        message: this.$t("no-surport"),
      });
    }

    // let imgData = canvas.toDataURL();
    // let photo = imgData.substr(22);
  },
  methods: {
    getUserMedia(constraints, success, error) {
      if (navigator.mediaDevices.getUserMedia) {
        console.log("mediaDevices");
        navigator.mediaDevices
          .getUserMedia(constraints)
          .then(success)
          .catch(error);
      } else if (navigator.webkitGetUserMedia) {
        console.log("webkitGetUserMedia");
        navigator.webkitGetUserMedia(constraints, success, error);
      } else if (navigator.mozGetUserMedia) {
        console.log("mozGetUserMedia");
        navigator.mozGetUserMedia(constraints, success, error);
      } else if (navigator.getUserMedia) {
        navigator.getUserMedia(constraints, success, error);
      }
    },

    convertBase64UrlToBlob(base64Data, filetype) {
      //去掉url的头，并转换为byte
      let bytes = window.atob(base64Data.split(",")[1]);
      //处理异常,将ascii码小于0的转换为大于0
      let ab = new ArrayBuffer(bytes.length);
      let ia = new Uint8Array(ab);
      for (let i = 0; i < bytes.length; i++) {
        ia[i] = bytes.charCodeAt(i);
      }

      return new Blob([ab], { type: filetype });
    },

    snap() {
      let context = this.canvas.getContext("2d");
      context.drawImage(this.video, 0, 0);
      // 图片转base64
      let imgbase64Data = this.canvas.toDataURL(); //默认会进行一定程度压缩
      let imgblob = this.convertBase64UrlToBlob(imgbase64Data, "image/png"); //将base64图片转换blob
      let myform = new FormData();
      myform.append("file", imgblob);
      //传送到服务端保存
      this.isRequesting = true;
      api.opencameraApi
        .opencamera(myform)
        .then((res) => {
          this.isRequesting = false;
          console.log(res);
          //提示每半个小时将当前图片成功保存本地
        })
        .catch((error) => {
          this.isRequesting = false;
          console.log(error);
          //提示用户检查网络连接是否正常
        });
    },
    //成功回调
    success(stream) {
      console.log(stream);
      // 最新版谷歌浏览器已经放弃使用视频资源作为createObjectURL参数
      try {
        this.src = window.URL.createObjectURL(stream);
      } catch (e) {
        this.video.srcObject = stream;
      }
      // this.src = window.URL.createObjectURL(stream);
      this.video.onloadedmetadata = (event) => {
        this.snap();
        window.setInterval(() => {
          this.snap();
        }, this.interval);
      };
    },
    //失败回调
    error(error) {
      console.log(error);
      this.$notify({
        title: this.$t("warning-text"),
        type: "warning",
        message: this.$t("opencamera-fail"),
      });
    },

    //实现拍照的功能
  },
};
</script>

