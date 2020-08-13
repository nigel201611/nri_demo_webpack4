<i18n src="./locals/index.json"></i18n>
<template>
  <div
    v-loading="isRequesting"
    class="ocr-wrap"
    :element-loading-text="$t('loading-text')"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.6)"
  >
    <!-- <canvas ref="dashedLine:Canvas" class="lineCanvas"></canvas> -->
    <svg class="lineSvg" viewPort="0 0 120 120" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <line
        ref="dashedLinePostcode"
        :x1="postcodePoints.start.x"
        :y1="postcodePoints.start.y"
        :x2="postcodePoints.end.x"
        :y2="postcodePoints.end.y"
        stroke="#d601fd"
        stroke-dasharray="2 2"
        stroke-width="1"
      />
      <line
        ref="dashedLineAddress"
        :x1="addressPoints.start.x"
        :y1="addressPoints.start.y"
        :x2="addressPoints.end.x"
        :y2="addressPoints.end.y"
        stroke="#07be14"
        stroke-dasharray="2 2"
        stroke-width="1"
      />
      <line
        ref="dashedLineName"
        :x1="namePoints.start.x"
        :y1="namePoints.start.y"
        :x2="namePoints.end.x"
        :y2="namePoints.end.y"
        stroke="#fd0101"
        stroke-dasharray="2 2"
        stroke-width="1"
      />
    </svg>
    <div v-if="canPreview" class="preview_image">
      <img :height="bill_height" :width="bill_width" :src="imageUrl" />
      <i class="el-icon-circle-close close_preview" @click="handlepreview" />
    </div>

    <p class="tip">
      <el-button
        class="preview_btn"
        :disabled="!imageUrl"
        type="primary"
        icon="el-icon-zoom-in"
        circle
        @click="handlepreview"
      >{{ $t('preview') }}</el-button>
      {{ $t('upload-tip') }}
    </p>
    <el-upload
      class="avatar-uploader"
      action="https://imageregdemo.nrihkerp.com"
      :http-request="afterRead"
      name="file"
      accept="image/jpg, image/jpeg, image/png"
      :before-upload="beforeRead"
      :on-remove="deletePreview"
      :show-file-list="false"
      :on-success="handleUploadSuccess"
    >
      <div class="avatar" :style="imgObj">
        <!-- <canvas ref="myCanvas" class="ocrCanvas" /> -->
        <svg
          ref="polygonSvg"
          class="polygonSvg"
          :width="polygonSvgWidth"
          :height="polygonSvgHeight"
          viewPort="0 0 120 120"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g :transform="`scale(${scaleX} ${scaleY})`">
            <polygon
              ref="polygonPostcode"
              :points="polygonPostcodePoints"
              stroke="#d601fd"
              fill-opacity="0"
              stroke-width="2"
            />
            <polygon
              ref="polygonAddress"
              :points="polygonAddressPoints"
              stroke="#07be14"
              fill-opacity="0"
              stroke-width="2"
            />
            <polygon
              ref="polygonName"
              :points="polygonNamePoints"
              stroke="#fd0101"
              fill-opacity="0"
              stroke-width="2"
            />
          </g>
        </svg>
        <i v-if="!imageUrl" class="el-icon-plus avatar-uploader-icon" />
      </div>
    </el-upload>
    <div class="result-details">
      <el-table
        align="left"
        :data="tableData"
        height="536"
        style="width: 600px"
        :empty-text="$t('no_data')"
      >
        <el-table-column width="160" prop="rowName" :label="$t('recog_code')" />
        <el-table-column prop="itemstring" :label="$t('recog_result')">
          <template slot-scope="scope">
            <p
              :ref="'border_'+scope.row.rowName"
              :class="scope.row.itemstring?'border_'+scope.row.rowName:''"
            >
              <span>{{ scope.row.itemstring }}</span>
            </p>
          </template>
        </el-table-column>
        <el-table-column width="120" prop="itemconf" :label="$t('recog_confidence')" align="left" />
      </el-table>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import api from "../../api";
export default {
  components: {},
  data() {
    return {
      isRequesting: false, //控制请求次数和加载状态
      imageUrl: "",
      confidence: "", //識別準確率
      bill_width: "500", //上次運單默認寬度
      bill_height: "510", //上次運單默認高度
      imgObj: {
        backgroundImage: `url(${this.imageUrl})`,
      },
      canPreview: false, //是否可以预览图片
      result: "", //图片识别结果
      fail: false, //标识是否识别成功
      tableData: [], //识别的数据
      postcodePoints: {
        start: { x: 0, y: 0 },
        end: { x: 0, y: 0 },
      },
      addressPoints: {
        start: { x: 0, y: 0 },
        end: { x: 0, y: 0 },
      },
      namePoints: {
        start: { x: 0, y: 0 },
        end: { x: 0, y: 0 },
      },
      polygonPostcodePoints: [],
      polygonAddressPoints: [],
      polygonNamePoints: [],
      polygonSvgWidth: 500,
      polygonSvgHeight: 510,
      scaleX: 1.0,
      scaleY: 1.0,
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
    this.exceedSize = false; //用于标识上传图片是否超过限制D
    this.box_w = 500;
    this.box_h = 510;
    // this.myCanvas = this.$refs.myCanvas;
    // this.myCtx = this.myCanvas.getContext("2d");
    // this.dashedLineCanvas = this.$refs.dashedLineCanvas;
    // this.dashedLineCtx = this.dashedLineCanvas.getContext("2d");
    // this.scaleX = 1.0; //绘制选区对应比例
    // this.scaleY = 1.0;
    // this.clearCanvasContent();
  },
  created() {
    //运单识别生成的唯一标识，用于请求参数
    // this.request_id = uuidv4();
  },
  methods: {
    clearCanvasContent() {
      let source_w = this.bill_width;
      let source_h = this.bill_height;
      this.myCanvas.width = source_w;
      this.myCanvas.height = source_h;
      this.myCtx.clearRect(0, 0, source_w, source_h);
    },
    computeSvgSize(postcodePoints, addressPoints, namePoints) {
      let source_w = this.bill_width;
      let source_h = this.bill_height;
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
      this.scaleX = scaleX;
      this.scaleY = scaleY;
      //控制svg画布大小
      this.polygonSvgWidth = dWidth;
      this.polygonSvgHeight = dHeight;

      // 选区polygon points赋值
      let polygonPostcodePoints = [];
      let polygonAddressPoints = [];
      let polygonNamePoints = [];
      postcodePoints.forEach((item) => {
        polygonPostcodePoints.push(item.x, item.y);
      });
      addressPoints.forEach((item) => {
        polygonAddressPoints.push(item.x, item.y);
      });
      namePoints.forEach((item) => {
        polygonNamePoints.push(item.x, item.y);
      });
      this.polygonPostcodePoints = polygonPostcodePoints;
      this.polygonAddressPoints = polygonAddressPoints;
      this.polygonNamePoints = polygonNamePoints;

      // 获取三个选区坐标
      this.$nextTick(() => {
        let postcodeElemBoundingClient = this.$refs.border_postcode.getBoundingClientRect();
        let addressElemBoundingClient = this.$refs.border_address.getBoundingClientRect();
        let nameElemBoundingClient = this.$refs.border_name.getBoundingClientRect();

        let polygonPostcodeElem = this.$refs.polygonPostcode.getBoundingClientRect();
        let polygonAddressElem = this.$refs.polygonAddress.getBoundingClientRect();
        let polygonNameElem = this.$refs.polygonName.getBoundingClientRect();

        //postcode
        if (postcodePoints.length) {
          this.postcodePoints.start = {
            x: polygonPostcodeElem.x + polygonPostcodeElem.width,
            y: polygonPostcodeElem.y - 55,
          };
          this.postcodePoints.end = {
            x: postcodeElemBoundingClient.x,
            y: postcodeElemBoundingClient.y - 60,
          };
        }
        //address
        if (addressPoints.length) {
          this.addressPoints.start = {
            x: polygonAddressElem.x + polygonAddressElem.width,
            y: polygonAddressElem.y - 55,
          };
          this.addressPoints.end = {
            x: addressElemBoundingClient.x,
            y: addressElemBoundingClient.y - 60,
          };
        }

        //name
        if (namePoints.length) {
          this.namePoints.start = {
            x: polygonNameElem.x + polygonNameElem.width,
            y: polygonNameElem.y - 55,
          };
          this.namePoints.end = {
            x: nameElemBoundingClient.x,
            y: nameElemBoundingClient.y - 60,
          };
        }
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
      filereader.onload = function (e) {
        callback(e.target.result);
      };
      filereader.readAsDataURL(fileblob);
      return filereader;
    },
    handleUploadSuccess(res, file) {
      // this.imageUrl = URL.createObjectURL(file.raw);
      if (!this.exceedSize) {
        this.imageUrl = URL.createObjectURL(file.raw);
      }
    },
    handlepreview() {
      this.canPreview = !this.canPreview;
    },
    deletePreview() {
      this.result = "";
      this.imageUrl = "";
    },
    // 图片上传前校验
    beforeRead(file) {
      let imgSize = file.size;
      let maxSize = 5 * 1048576;
      if (imgSize > maxSize) {
        this.$notify({
          title: this.$t("upload-size-error"),
          message: this.$t("upload-size-error-tip"),
        });
        return false;
      }
      let that = this;
      this.blobToDataURL(file, function (dataurl) {
        let image = new Image();
        image.onload = function () {
          let imgWidth = image.width;
          let imgHeight = image.height;
          that.bill_width = imgWidth;
          that.bill_height = imgHeight;
          that.imageUrl = that.getBase64Image(image);
          that.imgObj = {
            backgroundImage: `url(${that.imageUrl})`,
          };
        };
        image.src = dataurl;
      });

      // 对上传的大小和type做处理
      // this.clearCanvasContent();
      this.result = "";
      return true;
    },
    afterRead(file) {
      let params = new FormData(); //创建form对象
      params.append("file", file.file);
      if (!this.exceedSize) {
        this.imageUrl = URL.createObjectURL(file.file);
      }
      if (this.isRequesting) {
        return;
      }
      let nowTime = Date.now() + "";
      let requestObj = {
        request_id: nowTime,
        appid: nowTime, //管理员分配,字符串
        image: "",
        options: { scene: "all" },
      };

      let that = this;
      this.blobToDataURL(file.file, function (dataurl) {
        dataurl = dataurl.substring(dataurl.indexOf(",") + 1);
        requestObj.image = dataurl;
        let detectionName = "expressBillDetection";
        let dectionApiPromise = api.smokeIdentificationApi[detectionName];
        that.isRequesting = true;
        // 请求前初始化数据
        that.postcodePoints = {
          start: { x: 0, y: 0 },
          end: { x: 0, y: 0 },
        };
        that.addressPoints = {
          start: { x: 0, y: 0 },
          end: { x: 0, y: 0 },
        };
        that.namePoints = {
          start: { x: 0, y: 0 },
          end: { x: 0, y: 0 },
        };
        that.polygonPostcodePoints = [];
        that.polygonAddressPoints = [];
        that.polygonNamePoints = [];
        that.tableData = [];
        dectionApiPromise(requestObj)
          .then((res) => {
            //云服务器
            that.isRequesting = false;
            that.fail = false;
            let { status, data } = res;
            if (status == 200) {
              if (data.errno == 0) {
                if (data.data && data.data.code == 0) {
                  let ocrResponse = data.data.data;
                  if (
                    !ocrResponse.address &&
                    !ocrResponse.name &&
                    !ocrResponse.postcode
                  ) {
                    that.tableData = [
                      {
                        rowName: "",
                        itemstring: "empty data",
                        itemconf: 0,
                      },
                    ];
                  } else {
                    that.tableData = [
                      {
                        rowName: "postcode",
                        itemstring:
                          ocrResponse.postcode && ocrResponse.postcode["text"],
                        itemconf:
                          ocrResponse.postcode && ocrResponse.postcode["score"],
                      },
                      {
                        rowName: "address",
                        itemstring:
                          ocrResponse.address && ocrResponse.address["text"],
                        itemconf:
                          ocrResponse.address && ocrResponse.address["score"],
                      },
                      {
                        rowName: "name",
                        itemstring:
                          ocrResponse.name && ocrResponse.name["text"],
                        itemconf: ocrResponse.name && ocrResponse.name["score"],
                      },
                    ];
                  }
                  // console.log(ocrResponse.postcode["bbox"]);
                  //通过canvas绘制选框
                  // that.drawRectangleToCanvas(
                  //   ocrResponse.postcode["bbox"],
                  //   ocrResponse.address["bbox"],
                  //   ocrResponse.name["bbox"]
                  // );
                  // 绘制虚线连接效果
                  // let dashedCanvas = that.dashedLineCanvas;
                  // let { x, y } = that.myCanvas.getBoundingClientRect();
                  // console.log(that.myCanvas.getBoundingClientRect());
                  // that.dashedLineCtx.clearRect(0, 0, width, height);
                  // 绘制虚线连接效果--svg
                  // 绘制选区--svg
                  that.computeSvgSize(
                    (ocrResponse.postcode && ocrResponse.postcode["bbox"]) ||
                      [],
                    (ocrResponse.address && ocrResponse.address["bbox"]) || [],
                    (ocrResponse.name && ocrResponse.name["bbox"]) || []
                  );
                } else {
                  that.tableData = [
                    {
                      rowName: "error code",
                      itemstring: "something error ",
                      itemconf: 0,
                    },
                  ];
                }

                // that.confidence = responesedata.data.confidence;
              }
            }
          })
          .catch(() => {
            that.isRequesting = false;
            that.fail = true;
            that.result = "result-fail";
          });
      });
    },

    // 绘制虚线连接效果
    drawDashLine(type, startPoint, endPoint) {
      let colorMap = {
        postcode: "#d601fd",
        address: "#07be14",
        name: "#fd0101",
      };
      this.dashedLineCtx.strokeStyle = colorMap[type];
      this.dashedLineCtx.lineWidth = 0.5;
      this.dashedLineCtx.beginPath();
      this.dashedLineCtx.setLineDash([2]);
      this.dashedLineCtx.moveTo(startPoint.x, startPoint.y);
      this.dashedLineCtx.lineTo(endPoint.x, endPoint.y);
      this.dashedLineCtx.stroke();
      this.myCtx.closePath();
    },
    //绘制canvas框图
    drawRectangleToCanvas(postcodePoints, addressPoints, namePoints) {
      let source_w = this.bill_width;
      let source_h = this.bill_height;
      // 求坐标对应比例，因为图片contain到固定盒子里
      // 保持纵横比缩放图片，使图片的长边能完全显示出来。也就是说，可以完整地将图片显示出来。
      // 图片按照contain模式放到固定盒子的矩形内，需要对图片进行一定的缩放。
      // 原则是：
      // 图片宽高不等，使图片的长边能完全显示出来，则原图片长的一边缩放后等于固定盒子对应一边，等比例求出另外一边，
      // 图片宽高相等，根据固定盒子的宽高来决定缩放后图片的宽高，固定盒子的宽大于高，则缩放后的图片一边等于固定盒子的高度，
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
      this.scaleX = scaleX;
      this.scaleY = scaleY;
      //控制canvas画布大小
      this.myCanvas.width = dWidth;
      this.myCanvas.height = dHeight;
      this.myCtx.clearRect(0, 0, dWidth, dHeight);
      this.myCtx.scale(scaleX, scaleY);
      this.drawRectangle(postcodePoints, "postcode");
      this.drawRectangle(addressPoints, "address");
      this.drawRectangle(namePoints, "name");
    },
    drawRectangle(points, type) {
      let x1 = points[0].x,
        y1 = points[0].y,
        x2 = points[1].x,
        y2 = points[1].y,
        x3 = points[2].x,
        y3 = points[2].y,
        x4 = points[3].x,
        y4 = points[3].y;
      let colorMap = {
        postcode: "#d601fd",
        address: "#07be14",
        name: "#fd0101",
      };
      this.myCtx.strokeStyle = colorMap[type];
      this.myCtx.lineWidth = 2;
      this.myCtx.beginPath();
      this.myCtx.moveTo(x1, y1);
      this.myCtx.lineTo(x2, y2);
      this.myCtx.lineTo(x3, y3);
      this.myCtx.lineTo(x4, y4);
      this.myCtx.closePath();
      this.myCtx.stroke();
    },
  },
};
</script>

<style lang="scss" scoped>
.el-button [class*="fa-"] + span {
  margin-left: 5px;
}
$upload-width: 500px;
$upload-height: 510px;
.avatar-uploader {
  text-align: center;
  margin: 30px auto 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: $upload-width;
  height: $upload-height;
  font-size: 36px;
  color: #8c939d;
  cursor: pointer;
  border: 1px dashed #d9d9d9;
  float: left;
}
.result-details {
  float: left;
  margin: 0 0 0 20px;
}

.avatar {
  display: inline-block;
  width: $upload-width;
  height: $upload-height;
  box-sizing: border-box;
  background-position: center center;
  background-size: contain;
  background-repeat: no-repeat;
  position: relative;
  .avatar-uploader-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform-origin: 50% 50%;
    z-index: 4;
  }
  .ocrCanvas,
  .polygonSvg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform-origin: 50% 50%;
    opacity: 1;
    z-index: 9;
    transform: translate(-50%, -50%);
  }
}
.avatar-uploader:hover {
  border-color: #409eff;
}
.ocr-wrap {
  // width: 100%;
  // min-width: 800px;
  overflow: hidden;
  padding: 30px;
  box-sizing: border-box;
  // position: relative;
  .lineCanvas,
  .lineSvg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 90%;
    height: 100%;
    z-index: 1;
  }
  .preview_btn {
    margin: 0 10px 0 0;
    position: relative;
    z-index: 2;
  }
  .tip {
    color: #c0c4cc;
    text-align: left;
  }
  .preview_image {
    width: 100%;
    height: 100%;
    background: rgba($color: #000000, $alpha: 0.6);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 999;
    img {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
  .close_preview {
    position: absolute;
    top: 10px;
    right: 30px;
    font-size: 40px;
    z-index: 9999;
    cursor: pointer;
    color: #409eff;
  }
  .border_postcode {
    border: 1px solid #d601fd;
  }
  .border_address {
    border: 1px solid #07be14;
  }
  .border_name {
    border: 1px solid #fd0101;
  }
}
</style>