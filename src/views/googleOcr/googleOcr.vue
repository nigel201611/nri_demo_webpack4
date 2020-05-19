<!--
 * @Author: nigel
 * @Date: 2020-05-12 14:33:04
 * @LastEditTime: 2020-05-19 16:28:48
 -->
<i18n src="./locals/index.json"></i18n>
<template>
  <div class="generalocr_wrap">
    <el-row class="picture-container">
      <img
        v-for="(item, index) in imgArr"
        :key="index"
        :src="item.url"
        :class="[curentIndex == index ? 'pic-item_active' : '', 'pic-item']"
        @click="handleClickImg(item.url, index)"
      />
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
        <el-button type="primary">{{ $t("upload-btn-text") }}</el-button>
      </el-upload>
      <div class="url_input">
        <el-input v-model="input_url" :placeholder="$t('input_url_tip')" />
      </div>
      <el-button class="analyse-btn" type="primary" @click="handleAnalyse">{{ $t("analyse-btn") }}</el-button>
    </el-row>
    <el-row class="ocr-result">
      <img
        ref="imgOrigin"
        class="imgOrigin"
        :height="img_height"
        :width="img_width"
        :src="imageUrl"
      />
      <div
        ref="imgEdit"
        v-loading="uploadImgLoading"
        :element-loading-text="$t('customize-area-loading-tip')"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.6)"
        class="ocr_image"
        :style="imgObj"
      >
        <canvas ref="myCanvas" class="ocrGeneralCanvas" />
      </div>
      <div class="result-details">
        <el-table v-loading="isRequesting" :data="tableData" height="400" style="width: 100%">
          <el-table-column type="index" align="left" />
          <el-table-column prop="itemstring" :label="$t('recog_result')" align="left" />
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
    position: relative;
    z-index: 999;
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
    z-index: 9;
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
  { url: "/static/images/ocr_common01.jpg" },
  { url: "/static/images/ocr_common02.jpg" },
  { url: "/static/images/ocr_common07.jpg" },
  { url: "/static/images/ocr_common08.jpg" },
  { url: "/static/images/ocr_common05.jpg" },
  { url: "/static/images/ocr_common06.jpg" }
];
import { mapState } from "vuex";
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
      tableData: []
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
    this.imgOptions = {}; //中引文体验，多角度，其他语种体验不同选项
    this.box_w = 400;
    this.box_h = 410;
    this.myCanvas = this.$refs.myCanvas;
    this.myCtx = this.myCanvas.getContext("2d");
    //默认使用第一张图片
    this.imageUrl = this.imgArr[0].url;
    this.imgObj = {
      backgroundImage: `url(${this.imageUrl})`
    };
  },
  destroyed() {
    URL.revokeObjectURL(this.imageUrl);
  },
  methods: {
    /**
     * @name:init
     * @msg: 根据用户上传、切换不同图片、输入远程链接图片，
     * 单击分析按钮显示识别结果，url代表用户输入的远程图片链接
     * @param {url}
     * @return:
     */
    init(url) {
      // 判断是否有网络图片地址，有的话以网络图片优先
      if (this.input_url != "") {
        //目前对网络图片的框图有些问题，估计没有读取到正确的宽高
        let http_image_pattern = /^(http:\/\/|https:\/\/){1}.+\.(jpg|jpeg|png|bmp|pdf)$/gi;
        if (http_image_pattern.test(this.input_url)) {
          //目前对网络图片的框图有些问题，估计没有读取到正确的宽高
          this.imageUrl = url;
          this.imgObj = {
            backgroundImage: `url(${this.imageUrl})`
          };
          this.clearCanvasContent();
          this.googleGeneralOcr({ url: this.input_url }, this.imgOptions);
        } else {
          this.$notify({
            title: this.$t("tip-text"),
            message: this.$t("input_url-tip")
          });
        }
      } else {
        this.getImageToBase64Data(this.imageUrl).then(params => {
          //默认第一张图,调用接口返回数据
          this.googleGeneralOcr(params, this.imgOptions);
        });
      }
    },
    //绘制canvas框图
    drawRectangleByCanvas(coordpointArr) {
      let imgOrigin = this.$refs.imgOrigin;
      let source_w = imgOrigin.width;
      let source_h = imgOrigin.height;
      //如果有网络图片,计算网络图片宽高有些问题,网络图片有个加载过程
      if (this.input_url) {
        let imgElem = new Image();
        imgElem.onload = () => {
          source_w = imgElem.width;
          source_h = imgElem.height;
          //绘制框图
          this.drawRectangle(source_w, source_h, coordpointArr);
        };
        imgElem.src = this.input_url;
      } else {
        this.drawRectangle(source_w, source_h, coordpointArr);
      }
    },
    drawRectangle(source_w, source_h, coordpointArr) {
      // console.log(source_w, source_h);
      // 求坐标对应比例，因为图片contain到固定盒子里，400*410
      // 保持纵横比缩放图片，使图片的长边能完全显示出来。也就是说，可以完整地将图片显示出来。
      // 图片按照contain模式放到固定盒子的矩形内，需要对图片进行一定的缩放。
      // 原则是：
      // 图片宽高不等，使图片的长边能完全显示出来，则原图片长的一边缩放后等于固定盒子对应一边，等比例求出另外一边，
      // 图片宽高相等，根据固定盒子的宽高来决定缩放后图片的宽高，固定盒子的宽大于高，则缩放后的图片较长一边等于固定盒子的高度，
      // 对应求出另外一边即可，反之亦然。
      let dWidth = this.box_w;
      let dHeight = this.box_h;
      if (
        source_w > source_h ||
        (source_w == source_h && this.box_w < this.box_h)
      ) {
        dHeight = (source_h * dWidth) / source_w;
      } else if (
        source_w < source_h ||
        (source_w == source_h && this.box_w > this.box_h)
      ) {
        dWidth = (source_w * dHeight) / source_h;
      }
      let scaleX = 1;
      let scaleY = 1;
      scaleX = dWidth / source_w;
      scaleY = dHeight / source_h;
      //控制canvas画布大小
      this.myCanvas.width = dWidth;
      this.myCanvas.height = dHeight;
      this.myCtx.clearRect(0, 0, dWidth, dHeight);
      this.myCtx.scale(scaleX, scaleY);
      // console.log(source_w, source_h);
      for (let i = 0; i < coordpointArr.length; i++) {
        let item = coordpointArr[i].x;
        let x1 = item[0],
          y1 = item[1],
          x2 = item[2],
          y2 = item[3],
          x3 = item[4],
          y3 = item[5],
          x4 = item[6],
          y4 = item[7];
        this.myCtx.strokeStyle = "#00a4ff";
        this.myCtx.lineWidth = 4;
        this.myCtx.beginPath();
        this.myCtx.moveTo(x1, y1);
        this.myCtx.lineTo(x2, y2);
        this.myCtx.lineTo(x3, y3);
        this.myCtx.lineTo(x4, y4);
        this.myCtx.closePath();
        this.myCtx.stroke();
      }
    },
    //接口请求方法封装
    googleGeneralOcr(params, options = {}) {
      // params = Object.assign({}, params, options);
      params.options = options;
      // console.log(params);
      if (this.isRequesting) {
        return;
      }
      this.isRequesting = true;
      api.googleOcrApi
        .generalocr(params)
        .then(res => {
          this.isRequesting = false;
          res;
          this.tableData = [];
          if (res.status == 200) {
            if (res.data.errno === 0) {
              //array
              let resData = res.data.data || [];
              let responses = resData.responses || [];
              // 确认返回的responses有数据
              if (responses.length) {
                // 默认至于单个请求体，或者一个页面的请求
                let firstPage_response = responses[0] || {};
                let pagesArr = firstPage_response.fullTextAnnotation.pages;
                // pages里保存了blocks，blocks保存了识别出来的每行文字信息或者段落信息，以及对应的每行坐标
                //从blocks取出每行文字以及对应的confidence
                let blocksArr = pagesArr[0].blocks; //由于发送的请求只有一个，所以默认取第一个blocks
                //从blocksArr中获取该页面每行文字信息和坐标
                let coordpointArr = [];
                for (let i = 0; i < blocksArr.length; i++) {
                  let block = blocksArr[i];
                  let obj = {
                    itemstring: "",
                    itemconf: "",
                    coordpoint: []
                  };
                  // confidence
                  obj.itemconf = block["property"]
                    ? block["property"]["detectedLanguages"].confidence
                    : "";
                  // 该行对应坐标
                  obj.coordpoint = block["boundingBox"].vertices || [];
                  // 里面保存了每段或者每行的所有字符，将他们串联起来，保存到itemstring里
                  let paragraphs = block.paragraphs[0];
                  let words = paragraphs.words;
                  obj.itemstring = words.reduce((total, word) => {
                    let symbols = word.symbols;
                    symbols.forEach(element => {
                      total += element.text;
                    });
                    return total;
                  }, "");
                  this.tableData.push(obj);
                  //使用canvas绘制识别出的文本行在原图中矩形框
                  let coordpoint = obj.coordpoint.reduce((total, item) => {
                    let { x, y } = item;
                    return total.concat(x, y);
                  }, []);
                  coordpointArr.push({ x: coordpoint });
                }
                this.drawRectangleByCanvas(coordpointArr);
                //获取针对该页面的一个总的confidence
                // let avgConfidence =
                //   pagesArr[0].property["detectedLanguages"][0].confidence;
              }
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
      this.clearCanvasContent();
      this.imageUrl = image;
      this.imgObj = {
        backgroundImage: `url(${this.imageUrl})`
      };
      this.init();
    },
    clearCanvasContent() {
      let imgOrigin = this.$refs.imgOrigin;
      let source_w = imgOrigin.width;
      let source_h = imgOrigin.height;
      this.myCanvas.width = source_w;
      this.myCanvas.height = source_h;
      this.myCtx.clearRect(0, 0, source_w, source_h);
    },
    handleAnalyse() {
      if (this.isRequesting) {
        return;
      }
      this.init(this.input_url);
    },
    handleUploadSuccess(res, file) {
      this.uploadImgLoading = false;
      this.input_url = "";
      if (!this.exceedSize) {
        this.imageUrl = URL.createObjectURL(file.raw);
      }
      this.base64ImageData = "";
      // 上传成功重置类型为空,默认运单识别
      this.imgObj = {
        backgroundImage: `url(${this.imageUrl})`
      };
      //上传成功，将图片转换base64，调用ocr识别接口
      this.init();
    },
    // 图片上传前校验
    beforeRead(file) {
      let imgSize = file.size;
      let maxSize = 5 * 1048576;
      if (imgSize > maxSize) {
        this.exceedSize = true;
        this.$notify({
          title: this.$t("upload-size-error"),
          message: this.$t("upload-size-tip")
        });
        return false;
      }
      this.exceedSize = false;
      this.blobToDataURL(file, function(dataurl) {
        let image = new Image();
        image.onload = function() {
          this.img_width = image.width;
          this.img_height = image.height;
          //限制图片宽
        };
        image.src = dataurl;
      });
      this.clearCanvasContent();
      this.uploadImgLoading = true;
    }
  }
};
</script>