<i18n src="./locals/index.json"></i18n>
<template>
  <div class="generalocr_wrap">
    <el-row class="picture-container">
      <img
        v-for="(item,index) in imgArr"
        :key="index"
        :src="item.url"
        :class="[curentIndex==index ? 'pic-item_active' : '', 'pic-item']"
        @click="handleClickImg(item.url,index)"
      >
    </el-row>
    <el-row class="input_form">
      <el-upload
        class="generalocr-uploader"
        action="https://imageregdemo.nrihkerp.com"
        :show-file-list="false"
        accept="image/jpg, image/jpeg, image/png"
        :on-success="handleUploadSuccess"
        :before-upload="beforeRead"
      >
        <el-button type="primary">
          {{ $t('upload-btn-text') }}
        </el-button>
      </el-upload>
      <div class="url_input">
        <el-input
          v-model="input_url"
          :placeholder="$t('input_url_tip')"
        />
      </div>
      <el-button
        class="analyse-btn"
        type="primary"
        @click="handleAnalyse"
      >
        {{ $t('analyse-btn') }}
      </el-button>
    </el-row>
    <el-row class="ocr-result">
      <img
        ref="imgOrigin"
        class="imgOrigin"
        :height="img_height"
        :width="img_width"
        :src="imageUrl"
      >
      <div
        ref="imgEdit"
        v-loading="uploadImgLoading"
        :element-loading-text="$t('customize-area-loading-tip')"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.6)"
        class="ocr_image"
        :style="imgObj"
      >
        <canvas
          ref="myCanvas"
          class="ocrGeneralCanvas"
        />
      </div>
      <div class="result-details">
        <el-table
          v-loading="isRequesting"
          :data="tableData"
          height="400"
          style="width: 100%"
        >
          <el-table-column
            prop="parag.parag_no"
            :label="$t('number')"
            align="left"
          />
          <el-table-column
            prop="itemstring"
            :label="$t('recog_result')"
            align="left"
          />
        </el-table>
      </div>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.generalocr_wrap {
  text-align: center;
  .generalocr-uploader,
  .url_input,
  .analyse-btn {
    display: inline-block;
  }
  .imgtype_selector {
    margin: 50px 0 30px;
  }
  .analyse-btn {
    width: 140px;
  }
  .url_input {
    width: 840px;
    margin: 0 0 0 20px;
  }
  .input_form {
    text-align: center;
  }
}
.ocr-result {
  text-align: center;
  margin: 20px 0 0 0;
  .imgOrigin {
    position: absolute;
    top: 0;
    left: 0;
    transform-origin: 50% 50%;
    opacity: 0;
  }
  .ocrGeneralCanvas {
    position: absolute;
    top: 50%;
    left: 50%;
    transform-origin: 50% 50%;
    opacity: 1;
    z-index: 99999;
    transform: translate(-50%, -50%);
  }
  .ocr_image {
    width: 400px;
    height: 410px;
    margin-right: 20px;
    box-shadow: 0 5px 15px 0 rgba(47, 99, 150, 0.1);
    border: 1px solid rgba(#34b6fc, 0.1);
    box-sizing: border-box;
    display: inline-block;
    background-position: center center;
    background-size: contain;
    background-repeat: no-repeat;
    position: relative;
  }
  .result-details {
    display: inline-block;
    width: 780px;
    background: #fff;
    height: 400px;
    box-shadow: 0 5px 15px 0 rgba(47, 99, 150, 0.1);
    border: 1px solid rgba(#34b6fc, 0.1);
    box-sizing: border-box;
  }
}
.picture-container {
  text-align: center;
  margin: 30px;
  .pic-item_active {
    border: 4px solid #00a4ff;
    box-shadow: 0 5px 15px 0 rgba(43, 74, 130, 0.5);
  }
  .pic-item {
    display: inline-block;
    width: 200px;
    height: 150px;
    position: relative;
    box-sizing: border-box;
    cursor: pointer;
    &:hover {
      border: 4px solid #00a4ff;
      box-shadow: 0 5px 15px 0 rgba(43, 74, 130, 0.5);
    }
  }
}
.upload-btn {
  text-align: center;
  font-family: PingFangSC-Regular, helvetica neue, hiragino sans gb,
    microsoft yahei, tahoma, microsoft yahei ui, simsun, sans-serif;
  .internet-img {
    display: inline-block;
    margin-left: 19px;
    vertical-align: top;
    width: 1200px;
  }
}
</style>
<script>
const imgArrOrigin = [
  { url: "/static/images/handwriting_ocr/hnadwritingocr_1.png" },
  { url: "/static/images/handwriting_ocr/hnadwritingocr_2.png" },
  { url: "/static/images/handwriting_ocr/hnadwritingocr_3.png" },
  { url: "/static/images/handwriting_ocr/hnadwritingocr_4.png" },
  { url: "/static/images/handwriting_ocr/hnadwritingocr_5.png" },
  { url: "/static/images/handwriting_ocr/hnadwritingocr_6.png" },
  { url: "/static/images/handwriting_ocr/hnadwritingocr_7.jpg" },
  { url: "/static/images/handwriting_ocr/hnadwritingocr_8.png" }
];
import { mapActions, mapState } from "vuex";
import api from "../../api";
export default {
  data() {
    return {
      isRequesting: false, //控制请求次数和加载状态
      uploadImgLoading: false, //用于控制图片上传时有一个加载动效
      imageUrl: "",
      img_height: "",
      img_width: "",
      imgObj: {
        backgroundImage: `url(${this.imageUrl})`
      },
      input_url: "",
      imgArr: imgArrOrigin,
      curentIndex: 0,
      isCurrentType: "ch_en_ex", //标识当前通用识别类型，分中英文体验，中英文多角度体验，其他语种体验
      tableData: []
    };
  },
  watch: {
    locals(val) {
      this.$i18n.locale = val;
    }
  },
  mounted() {
    this.imgOptions = {}; //中引文体验，多角度，其他语种体验不同选项
    this.box_w = 400;
    this.box_h = 410;
    this.myCanvas = this.$refs.myCanvas;
    this.myCtx = this.myCanvas.getContext("2d");
    //默认使用第一张图片
    this.init(this.imgArr[0].url);
  },
  computed: {
    ...mapState({
      locals: state => state.menuStore.locals
    })
  },
  destroyed() {
    URL.revokeObjectURL(this.imageUrl);
  },
  methods: {
    init(url) {
      this.imageUrl = url;
      this.imgObj = {
        backgroundImage: `url(${this.imageUrl})`
      };
      // 判断是否有网络图片地址，有的话以网络图片优先
      if (this.input_url != "") {
        this.tengxunHandwritingOcr({ url: this.input_url }, this.imgOptions);
      } else {
        this.getImageToBase64Data(this.imageUrl).then(params => {
          this.tengxunHandwritingOcr(params, this.imgOptions);
        });
      }
    },

    //接口请求方法封装
    tengxunHandwritingOcr(params, options = {}) {
      params.options = options;
      if (this.isRequesting) {
        return;
      }
      this.isRequesting = true;
      api.tengxunApi
        .handwritingocr(params)
        .then(res => {
          this.isRequesting = false;
          if (res.status == 200) {
            let resData = res.data.data;
            let { errorcode } = resData;
            if (errorcode === 0) {
              this.tableData = resData.items;
            }
          }
        })
        .catch(error => {
          console.log(error);
          this.isRequesting = false;
          this.result = this.$t("recognition-fail");
        });
    },
    //根据图片路径url新建图片对象，转换base64
    getImageToBase64Data(url) {
      //转换图片为base64
      return new Promise((resolve, reject) => {
        let imgElem = new Image();
        imgElem.onload = () => {
          let img_base64 = this.getBase64Image(imgElem);
          //构造接口请求参数，前端只需要传image或者url即可
          let pramas = {
            image: img_base64,
            url: ""
          };
          //返回接口请求需要的参数
          this.img_width = imgElem.width;
          this.img_height = imgElem.height;
          resolve(pramas);
        };
        imgElem.onerror = () => {
          reject(new Error("Could not load image at " + url));
        };
        imgElem.src = url;
      });
    },
    // 图片对象转base64
    getBase64Image(img) {
      let canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      let ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, img.width, img.height);
      let ext = img.src.substring(img.src.lastIndexOf(".") + 1).toLowerCase();
      let dataURL = canvas.toDataURL("image/" + ext);
      return dataURL;
    },
    //**blob to dataURL**
    blobToDataURL(fileblob, callback) {
      let filereader = new FileReader();
      filereader.onload = function(e) {
        callback(e.target.result);
      };
      filereader.readAsDataURL(fileblob);
      return filereader;
    },
    //处理用户单击选择图片
    handleClickImg(image, index) {
      if (this.isRequesting) {
        return;
      }
      //消除用戶自己輸入遠程圖片鏈接
      this.input_url = "";
      this.curentIndex = index;
      this.init(image);
    },
    handleAnalyse() {
      if (this.isRequesting) {
        return;
      }
      //驗證當前輸入input_url是否是http开头或者合法远程链接
      let http_image_pattern = /^(http:\/\/|https:\/\/){1}.+\.(jpg|jpeg|png|bmp|pdf)$/gi;
      if (this.input_url != "" && http_image_pattern.test(this.input_url)) {
        this.init(this.input_url);
      } else {
        this.$notify({
          title: this.$t("tip-text"),
          message: this.$t("input_url-tip")
        });
      }
    },
    handleUploadSuccess(res, file) {
      this.uploadImgLoading = false;
      if (!this.exceedSize) {
        this.imageUrl = URL.createObjectURL(file.raw);
      }
      this.base64ImageData = "";
      // 上传成功重置类型为空,默认运单识别
      this.imgObj = {
        backgroundImage: `url(${this.imageUrl})`
      };
      //上传成功，将图片转换base64，调用ocr识别接口
      this.init(this.imageUrl);
    },
    // 图片上传前校验
    beforeRead(file) {
      let imgSize = file.size;
      let maxSize = 5 * 1048576;
      if (imgSize > maxSize) {
        this.$notify({
          title: this.$t("upload-size-error"),
          message: this.$t("upload-size-tip")
        });
        return false;
      }
      let type = file.type;
      this.exceedSize = false;
      let that = this;
      this.blobToDataURL(file, function(dataurl) {
        let image = new Image();
        image.onload = function() {
          this.img_width = image.width;
          this.img_height = image.height;
          //限制图片宽
        };
        image.src = dataurl;
      });
      this.uploadImgLoading = true;
    }
  }
};
</script>
