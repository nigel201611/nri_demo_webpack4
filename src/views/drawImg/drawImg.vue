<i18n src="./locals/index.json"></i18n>
<template>
  <div
    v-loading="isRequesting"
    class="ocr-wrap"
    :element-loading-text="$t('during-recognition')"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.6)"
  >
    <el-upload
      ref="upload"
      class="upload-demo"
      action="https://imageregdemo.nrihkerp.com"
      :before-upload="beforeRead"
      :show-file-list="false"
      accept="image/jpg, image/jpeg, image/png"
      :on-success="handleUploadSuccess"
    >
      <el-button class="upload_btn" size="small" type="primary">{{ $t('upload-btn-text') }}</el-button>
      <span class="tip">{{ $t('upload-btn-tip') }}</span>
    </el-upload>

    <div class="btn-list">
      <el-row class="choice-type">
        <el-select
          v-model="type"
          size="small"
          clearable
          :disabled="!imageUrl"
          class="detectionList"
          :placeholder="$t('upload-placehoder')"
          @clear="handleClearSelect"
          @change="handleChangeSelect"
        >
          <el-option
            v-for="item in btnList"
            :key="$t(item.text)"
            :label="$t(item.text)"
            :value="item.type"
          />
        </el-select>

        <el-button
          :disabled="!imageUrl"
          type="success"
          size="small"
          @click="confirmDetect"
        >{{ $t('confirm-detect') }}</el-button>
        <el-button
          :disabled="!imageUrl"
          type="primary"
          size="small"
          @click="saveCustomize"
        >{{ $t('save-current') }}</el-button>
        <el-button
          :disabled="!imageUrl"
          type="primary"
          size="small"
          @click="cancelEditBtn"
        >{{ $t('clear-area') }}</el-button>
      </el-row>

      <el-row v-show="imageUrl" class="image-btn">
        <el-button
          :title="$t('rotate')"
          type="info"
          size="small"
          class="fa fa-rotate-right"
          @click="handleClockwise"
        />
        <el-button
          :disabled="deg==-360"
          :title="$t('anticlock-rotate')"
          type="info"
          size="small"
          class="fa fa-rotate-left"
          @click="handleAnticlockwise"
        />
        <el-button
          :title="$t('scale-pic')"
          type="info"
          size="small"
          class="fa fa-search-plus"
          @click="handleEnlarge"
        />
        <el-button
          :title="$t('zooms-in')"
          type="info"
          size="small"
          class="fa fa-search-minus"
          @click="handleShrink"
        />
        <el-button
          :title="$t('reset-btn')"
          class="fa fa-hand-stop-o"
          :disabled="!imageUrl"
          type="primary"
          size="small"
          @click="handleReset"
        />
      </el-row>
    </div>

    <el-dialog :title="$t('confirm-dialog-title')" :visible.sync="restoreDialogVisible" width="30%">
      <span>{{ $t('confirm-dialog-tip') }}</span>
      <span slot="footer" class="dialog-footer">
        <el-button type="info" @click="handleNoTip">{{ $t('no-tip') }}</el-button>
        <el-button @click="restoreDialogVisible = false">{{ $t('dialog-cancel-btn') }}</el-button>
        <el-button type="primary" @click="handleConfirmRestore">{{ $t('dialog-confirm-btn') }}</el-button>
      </span>
    </el-dialog>

    <!-- 可以供用户自定义区域 -->
    <div class="usercustomize_area">
      <img ref="imgElem" class="imgElem" :height="bill_height" :width="bill_width" :src="imageUrl" />
      <div
        ref="imgEdit"
        v-loading="uploadImgLoading"
        :element-loading-text="$t('customize-area-loading-tip')"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.6)"
        class="img-wrap"
        :style="imgObj"
      />
      <!-- 展示自定义区域识别结果 -->
      <div v-if="resDetectDataArr.length" class="result_wrap">
        <el-card v-for="(item,index) in resDetectDataArr" :key="index" class="box-card">
          <div slot="header" class="clearfix box-card_header">
            <span>{{ $t(resTitleArr[item.type]) }}</span>
            <el-badge v-if="item.confidence!=0" :value="item.confidence+'%'" class="confidence">
              <span>{{ $t('result-confidence') }}</span>
            </el-badge>
            <el-badge v-else value="0" class="confidence">
              <span>{{ $t('result-confidence') }}</span>
            </el-badge>
          </div>
          <div class="text item">
            <img :src="item.imgUrl" />
            <!-- item.code=0,有时候返回的text是空的，要做下处理 -->
            <p
              v-if="item.code==0&&item.type!='nri_T_general'&&item.type!='nri_G_general'"
            >{{ item.text }}</p>
            <p v-else-if="item.code==0&&item.type=='nri_T_general'">
              <el-table :data="item.text" height="300" style="width: 100%">
                <el-table-column type="index" width="50" />
                <el-table-column prop="itemstring" :label="$t('recog_result')" align="left" />
                <el-table-column prop="itemconf" :label="$t('recog_confidence')" align="left" />
              </el-table>
            </p>
            <p v-else-if="item.code==0&&item.type=='nri_G_general'">
              <el-table :data="item.text" height="300" style="width: 100%">
                <el-table-column type="index" width="50" />
                <el-table-column prop="itemstring" :label="$t('recog_result')" align="left" />
                <el-table-column prop="itemconf" :label="$t('recog_confidence')" align="left" />
              </el-table>
            </p>
            <p v-else-if="item.code==1&&item.type=='nri_G_general'">
              <el-table :data="item.text" height="300" style="width: 100%">
                <el-table-column type="index" width="50" />
                <el-table-column prop="itemstring" :label="$t('recog_result')" align="left" />
                <el-table-column prop="itemconf" :label="$t('recog_confidence')" align="left" />
              </el-table>
            </p>
            <p v-else-if="item.code==-1" class="error">{{ $t('reuslt-error') }}</p>
            <p v-else class="error">{{ $t('backend_error') }}</p>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ocr-wrap {
  width: 98%;
  padding: 30px 0 0 30px;
  overflow: hidden;
  .preview_btn {
    margin: 0 10px 0 0;
  }

  .usercustomize_area {
    position: relative;
    overflow-x: auto;
    .imgElem {
      position: absolute;
      top: 0;
      left: 0;
      transform-origin: 50% 50%;
      opacity: 0;
    }
  }
  .img-wrap {
    position: relative;
    margin: 0 30px 10px 0;
    cursor: crosshair;
    float: left;
    .rect_item {
      z-index: 99999;
    }
    // overflow-x: auto;
  }
  .btn-list {
    margin: 0 0 80px 0;
    padding: 0 0 80px 0;
    border-bottom: 1px dashed #d9d9d9;
    position: relative;
    .choice-type {
      margin: 0 0 10px 0;
    }
    .detectionList {
      width: 180px;
      margin: 0 10px 0 0;
    }
    .image-btn {
      position: absolute;
      right: 20px;
      bottom: 10px;
      z-index: 999;
    }
  }
  .upload_btn {
    margin: 0 10px 10px 0;
    position: relative;
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
  // 结果展示
  .result_wrap {
    float: left;
    // margin: 0 0 0 30px;
  }
  .text {
    font-size: 14px;
  }

  .item {
    margin-bottom: 18px;
    .error {
      color: #e6a23c;
      width: 300px;
      white-space: normal;
    }
  }

  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both;
  }

  .box-card_header {
    font-size: 16px;
    // overflow: hidden;
  }
  .box-card_header .confidence {
    float: right;
    margin: 0 40px 0 0;
  }
}
</style>

<script>
import { mapState } from "vuex";
import api from "../../api";
export default {
  data() {
    return {
      isRequesting: false, //控制请求次数和加载状态
      imageUrl: "",
      btnList: [
        { flag: false, text: "express-bill-dectect", type: "expressbill" },
        { flag: false, text: "postcode-dectect", type: "postcode" },
        { flag: false, text: "T_general", type: "T_general" },
        { flag: false, text: "G_general", type: "G_general" }
      ], //用于保存类型功能按钮
      resTitleArr: {
        nri_expressbill: "waybill-result",
        nri_postcode: "zipcode-result",
        nri_T_general: "T_general",
        nri_G_general: "G_general"
      }, //保存标题和识别类型映射关系，
      imgObj: {
        background: `url(${this.imageUrl}) no-repeat 0 0`,
        backgroundSize: "cover",
        width: this.bill_width + "px",
        height: this.bill_height + "px",
        transform: "rotate(0)"
      },
      confidence: "", //識別準確率
      bill_width: "680", //運單默認寬度
      bill_height: "400", //運單默認高度
      result: "", //图片识别结果
      dialogVisible: false, //控制对话框关闭
      type: "expressbill", //标识当前识别类型
      origin: {
        x: 0,
        y: 0
      }, //鼠标刚开始按下的点
      deg: 0, //旋转的角度，默认从0度开始
      uploadImgLoading: false, //用于控制图片上传时有一个加载动效
      endpoint: { x: 0, y: 0 }, //鼠标移动后终点坐标
      // userDataImage: [], //保存用户自定义区域转换后的图片数据,base64格式
      resDetectDataArr: [], //自定义区域图片识别后返回的数据
      restoreDialogVisible: false, //用于控制是否加载上次保存过的自定义区域数据标识
      editImageArr: [] //用于保存用户自定义类型的区域坐标原点和宽高以及类型{type:'expressbill',x:0,y:0,width:100,height:100}--目前只考虑每个类型只能自定义一个区域
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
    this.userCustomizeArr = []; //用于保存用户自定义区域图片相关发送接口请求参数
    this.userDataImage = []; //用于保存用户自定义区域图片base64数据,后面用于拼接到resDetectDataArr，用于展示界面数据
    this.startXY = { x: 0, y: 0 }; //用于保存用户按下鼠标起点x,y注意和offsetX区别
    this.endXY = { x: 0, y: 0 }; //用于保存用户按下鼠标终点x,y注意和offsetX区别，和startXY一起用于准确计算宽高
    this.dragInfoWidthHeight = {
      width: 0,
      height: 0
    };
    this.exceedSize = false; //用于标识上传图片是否超过限制D
    // 从缓存读取editImageArr
    this.customizeImageArrInLocal = storeLocal.get("customizeImageArr") || [];
    // 提前创建好canvas元素
    this.myCanvas = document.createElement("canvas");
    this.myCtx = this.myCanvas.getContext("2d");
    this.OriginImageUrl = "";
    this.scaleMini = 1; //缩小比例
    this.scaleMax = 1; //放大比例
    this.scaleStep = 0;
  },
  destroyed() {
    URL.revokeObjectURL(this.imageUrl);
  },
  methods: {
    addEditableFunc() {
      let oBox = this.$refs.imgEdit;
      //鼠标按下，获取初始点
      oBox.onmousedown = ev => {
        //事件延迟性，如果用户框选了区域后，再次选择识别类型下拉框，这里的this.type还是上次的，并没有及时获取到
        // console.log(this.type);
        //那么需要提示用户选择对应类型
        if (!this.type) {
          this.$notify({
            title: this.$t("warning-text"),
            type: "warning",
            message: this.$t("choice-recognition-type")
          });
          //把之前画出的区域删除,并且oBox不只有一个孩子节点
          oBox.innerHTML = "";
          return false;
        }
        ev = window.event || ev;
        //1.获取按下的点
        let x1 = ev.offsetX;
        let y1 = ev.offsetY;
        //记录鼠标按下的点
        this.origin = {
          x: x1,
          y: y1
        };
        this.startXY = {
          x: ev.x,
          y: ev.y
        };
        //2.创建div
        let oDiv = document.createElement("div");
        oDiv.setAttribute("class", "rect_item");
        oBox.onmousemove = e => {
          // 会不断触发
          e = window.event || e;
          let x2 = e.offsetX;
          let y2 = e.offsetY;
          this.endXY = {
            x: e.x,
            y: e.y
          };
          let x1 = this.origin.x,
            y1 = this.origin.y;
          // 鼠标移动的点处理，为啥往右下移动过程中，横坐标会变小,offsetX有问题
          let width = Math.abs(this.endXY.x - this.startXY.x);
          let height = Math.abs(this.endXY.y - this.startXY.y);

          //对width和height做限制至少大于25
          this.dragInfoWidthHeight = {
            width,
            height
          };
          //3.设置div的样式,2,61分别矫正位置用
          oDiv.style.left = x1 + "px";
          oDiv.style.top = y1 + "px";
          oDiv.style.width = width + "px";
          oDiv.style.height = height + "px";
          oDiv.style.border = "1px solid red";
          oDiv.style.position = "absolute";
          this.endpoint = {
            x: x2,
            y: y2
          };
          oBox.appendChild(oDiv);
          if (width <= 30) {
            oBox.removeChild(oDiv);
          }
          // 记录用户自定义区域的原点和宽高，保存在对象中,并且添加是什么类型的识别，比如运单还是邮编，typearr=[expressbill,postcode]
          //如果在这里面记录坐标相关信息,会反复触发多次
        };

        oBox.onmouseup = () => {
          let x1 = this.origin.x,
            y1 = this.origin.y;
          // 记录用户自定义区域的原点和宽高，保存在对象中,并且添加是什么类型的识别，比如运单还是邮编，typearr=[expressbill,postcode]
          // 目前限制每个类型识别只能自定义一个区域
          //推送到editImageArr可以判断对应类型有没有数据，如果有，提示用户
          //如果已经有该类型区域
          // 注释掉先
          // if (that.hasClickedTypeFunc()) {
          //   return false;
          // }
          // console.log(that.dragInfoWidthHeight);
          // 对width和height做限制,至少大于25
          let { width, height } = this.dragInfoWidthHeight;
          if (width > 30) {
            this.editImageArr.push({
              type: this.type,
              x: x1,
              y: y1,
              width: width,
              height: height
            });
          }
        };
      };
      //在鼠标抬起后终止onmousemove事件
      document.onmouseup = function() {
        oBox.onmousemove = null;
        oBox.onmouseup = null;
      };
    },
    // 限制某种识别类型只能是一个区域
    hasClickedTypeFunc() {
      let imageArr = this.editImageArr;
      let hastypeFlag = imageArr.some(item => {
        return item.type == this.type;
      });
      if (hastypeFlag) {
        this.$notify({
          title: this.$t("warning-text"),
          type: "warning",
          message: this.$t("limit-one-cur-area-tip")
        });
        // 清除当前画出的rect_item,还有种情况是用户只是单击了下，由于促发了mouseup,mousedown，需要判断下是否只有一个孩子节点
        let oBox = this.$refs.imgEdit;
        // console.log(oBox.childElementCount);
        // 这种清除最后孩子节点，有时候有些问题!!
        let lastChild = oBox.lastElementChild
          ? oBox.lastElementChild
          : oBox.lastChild;
        if (oBox.childElementCount != 1) {
          oBox.removeChild(lastChild);
        }

        return true;
      }
    },
    removeEditableFunc() {
      let oBox = this.$refs.imgEdit;
      oBox.innerHTML = "";
      oBox.onmousemove = null;
      oBox.onmouseup = null;
      oBox.onmousedown = null;
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
    handleReset() {
      this.deg = 0;
      let oBox = this.$refs.imgEdit;
      oBox.innerHTML = "";
      this.type = "";
      this.editImageArr = []; //用于保存用户自定义类型的区域坐标原点和宽高以及类型{type:'expressbill',x:0,y:0,width:100,height:100}--目前只考虑每个类型只能自定义一个区域
      this.userCustomizeArr = []; //用于保存用户自定义区域图片转换处理后相关接口请求参数
      this.scaleMax = 1;
      this.imageUrl = this.OriginImageUrl;
      this.imgObj.background = `url(${this.imageUrl}) no-repeat 0 0`;
      this.imgObj.transform = `scale(1)`;
    },
    rotateCanvasDeg() {
      let imgElem = this.$refs.imgElem;
      //不是通过样式旋转背景,而是通过canvas旋转，然后在转换图片，后面框图得到的数据才会准确
      let width = imgElem.width;
      let height = imgElem.height;
      this.myCanvas.width = width;
      this.myCanvas.height = height;
      // this.myCanvas.style.transform = `rotate(${this.deg}deg)`;
      this.myCtx.save();
      this.myCtx.clearRect(0, 0, width, height);
      // 中心旋转图片
      this.myCtx.translate(width / 2, height / 2);
      // 转换弧度
      this.myCtx.rotate((this.deg / 180) * Math.PI);
      this.myCtx.translate(-width / 2, -height / 2);
      // 不需要绘制到中心，本身画布就保持和图片一样大小的！！！！
      this.myCtx.drawImage(imgElem, 0, 0, width, height);
      this.myCtx.restore();
      // 再将canvas转换图片
      return this.myCanvas.toDataURL("image/jpeg");
    },
    //顺时针旋转图片
    handleClockwise() {
      this.deg++;
      this.deg %= 360;
      let curImageUrl = this.rotateCanvasDeg(this.deg);
      //保存每次旋转后的图片数据，base64
      this.base64ImageData = curImageUrl;
      this.imgObj.background = `url(${curImageUrl}) no-repeat 0 0`;
    },
    //逆时针旋转图片
    handleAnticlockwise() {
      this.deg--;
      this.deg %= 360;
      let curImageUrl = this.rotateCanvasDeg(this.deg);
      //保存每次旋转后的图片数据，base64
      this.base64ImageData = curImageUrl;
      this.imgObj.background = `url(${curImageUrl}) no-repeat 0 0`;
    },
    handleEnlarge() {
      //图片放大
      this.scaleMax += 0.01;
      ++this.scaleStep; //用于计数用户单击多少次放大
      if (this.scaleMax >= 1.5) {
        //最大1.5倍
        this.scaleMax = 1;
        this.$notify({
          title: this.$t("tip-text"),
          message: this.$t("scale-max-tip")
        });
        return false;
      }
      let scale = this.scaleMax;
      this.imgObj.transform = `scale(${scale})`;
    },
    handleShrink() {
      //图片缩小
      this.scaleMax -= 0.01;
      // 在原来的基础上缩小
      if (this.scaleMax < 1) {
        //最大2.5倍
        this.scaleMax = 1;
        this.$notify({
          title: this.$t("tip-text"),
          message: this.$t("scale-min-tip")
        });

        return false;
      }

      let scale = this.scaleMax;
      this.imgObj.transform = `scale(${scale})`;
    },
    handleClearSelect() {
      let oBox = this.$refs.imgEdit;
      oBox.innerHTML = "";
      this.editImageArr = []; //用于保存用户自定义类型的区域坐标原点和宽高以及类型{type:'expressbill',x:0,y:0,width:100,height:100}--目前只考虑每个类型只能自定义一个区域
      this.userCustomizeArr = []; //用于保存用户自定义区域图片转换处理后相关接口请求参数
    },
    handleChangeSelect(type) {
      this.type = type;
    },
    // 获取图片的元数据属性
    // getExif(img) {
    //   Exif.getData(img, function() {
    //     let Orientation = Exif.getTag(this, "Orientation");
    //     // console.log(Orientation);
    //   });
    // },
    handleUploadSuccess(res, file) {
      //先删除之前添加的框图事件，以免重复添加
      this.removeEditableFunc();
      // 添加框图或者自定义图片区域相关事件
      this.addEditableFunc();
      // 关闭加载进度
      this.uploadImgLoading = false;
      // 通过URL.createObjectURL生成零时用图片链接
      // 在上传成功后，根据imageUrl通过canvas生成base64,方便以后真实放大旋转图片用
      // 这样在框图的时候也是框的真实图片数据
      if (!this.exceedSize) {
        console.log("the image not exceed size");
        this.imageUrl = URL.createObjectURL(file.raw);
        this.OriginImageUrl = this.imageUrl;
      }

      this.base64ImageData = "";
      // 上传成功重置类型为空,默认运单识别
      // this.type = "";
      this.imgObj = {
        background: `url(${this.imageUrl}) no-repeat 0 0`,
        backgroundSize: "cover",
        width: this.bill_width + "px",
        height: this.bill_height + "px",
        transform: "rotate(0)"
      };
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
          let width = image.width;
          let height = image.height;
          that.bill_width = width;
          that.bill_height = height;
          //限制图片宽
          let iswidthAllow = width >= 1920;
          // 获取图片元数据属性,暂时不需要矫正用户横着的图片
          // that.getExif(image);
          if (iswidthAllow) {
            //如果用户上传的图片宽大于1920,那么固定显示区域宽高
            that.$notify({
              title: that.$t("upload-type-error"),
              message: that.$t("upload-width-error-tip")
            });

            //计算比例,如果用户上传图片宽度超过1920,按固定比例显示用户上传图片
            let ratio = width / height;
            let fixedWidth = 1920;
            let fixedHeight = fixedWidth / ratio;
            that.bill_width = fixedWidth;
            that.bill_height = fixedHeight;

            // 如果图片超过限制，那么需要重新计算imageUrl
            image.width = fixedWidth;
            image.height = fixedHeight;
            that.imageUrl = that.getBase64Image(image);
            that.OriginImageUrl = that.imageUrl;
            that.exceedSize = true;
          }
        };
        image.src = dataurl;
      });

      // 对上传的大小和type做处理
      if (
        type !== "image/jpeg" &&
        type !== "image/jpg" &&
        type !== "image/png"
      ) {
        this.$notify({
          title: this.$t("upload-type-error"),
          message: this.$t("upload-type-error-tip")
        });
        return false;
      }
      this.result = "";
      this.imageUrl = "";
      this.deg = 0;
      this.imgObj = {
        background: `url(${this.imageUrl}) no-repeat 0 0`,
        backgroundSize: "cover",
        width: this.bill_width + "px",
        height: this.bill_height + "px",
        transform: "rotate(0)"
      };
      // 前面校验通过，显示上传图片加载动效,并将之前上传的数据清空
      let oBox = this.$refs.imgEdit;
      oBox.innerHTML = "";
      this.resetArr();
      // 上传图片加载动态
      this.uploadImgLoading = true;
      //从本地缓存获取到上次自定义区域数据，提示给用户
      this.customizeImageArrInLocal = storeLocal.get("customizeImageArr") || [];
      if (this.customizeImageArrInLocal.length) {
        // 让用户自己选择是否恢复上次保存过的自定义区域
        this.restoreDialogVisible = true;
      }
      return true;
    },
    drawRect(x1, y1, width, height) {
      let oDiv = document.createElement("div");
      oDiv.setAttribute("class", "rect_item");
      oDiv.style.left = x1 + "px";
      oDiv.style.top = y1 + "px";
      oDiv.style.width = width + "px";
      oDiv.style.height = height + "px";
      oDiv.style.border = "1px solid red";
      oDiv.style.position = "absolute";
      return oDiv;
    },

    handleConfirmRestore() {
      // 让type默认恢复到之前选择的
      // this.type = storeLocal.get("type") || '';
      this.editImageArr = this.customizeImageArrInLocal;
      // 根据相应数据，画出对应区域标识框
      let oBox = this.$refs.imgEdit;
      for (let i = 0; i < this.editImageArr.length; i++) {
        let item = this.editImageArr[i];
        let oDiv = this.drawRect(item.x, item.y, item.width, item.height);
        oBox.appendChild(oDiv);
      }
      this.restoreDialogVisible = false;
    },

    handleNoTip() {
      this.restoreDialogVisible = false;
      //清理缓存
      storeLocal.remove("customizeImageArr");
    },

    resetArr() {
      this.removeEditableFunc();
      this.editImageArr = []; //用于保存用户自定义类型的区域坐标原点和宽高以及类型{type:'expressbill',x:0,y:0,width:100,height:100}--目前只考虑每个类型只能自定义一个区域
      this.userCustomizeArr = []; //用于保存用户自定义区域图片转换处理后相关接口请求参数
      this.resDetectDataArr = []; //自定义区域图片识别后返回的数据
      this.userDataImage = []; //用于保存用户自定义区域图片base64数据,后面用于拼接到resDetectDataArr，用于展示界面数据
    },

    saveCustomize() {
      // 保存用户本次自定义区域相关数据存放在本地缓存中，演示用，具体项目，可能需要结合模板管理功能，联系用户账号
      if (this.editImageArr.length) {
        storeLocal.set("customizeImageArr", this.editImageArr);
        this.$notify({
          title: this.$t("tip-text"),
          message: this.$t("save-succ")
        });
      } else {
        this.$notify({
          title: this.$t("tip-text"),
          message: this.$t("no-cur-area")
        });
      }
    },
    cancelEditBtn() {
      this.btnList.map(item => {
        return (item.flag = false);
      });
      // this.removeEditableFunc();
      //清除盒子下新增的子节点
      let oBox = this.$refs.imgEdit;
      oBox.innerHTML = "";
      this.editImageArr = [];
      this.userCustomizeArr = [];
      this.userDataImage = [];
      // 默认运单识别,或着用户之前选择的类型
      // this.type = "";
    },
    // 处理谷歌通用印刷体识别
    handleGoogleOcrData(resData) {
      let responses = resData.responses || [];
      // 确认返回的responses有数据
      const googleItems = [];
      if (responses.length && JSON.stringify(responses[0]) != "{}") {
        // 默认至于单个请求体，或者一个页面的请求
        let firstPage_response = responses[0] || {};
        let pagesArr = firstPage_response.fullTextAnnotation.pages;
        // pages里保存了blocks，blocks保存了识别出来的每行文字信息或者段落信息，以及对应的每行坐标
        //从blocks取出每行文字以及对应的confidence
        let blocksArr = pagesArr[0].blocks; //由于发送的请求只有一个，所以默认取第一个blocks
        //从blocksArr中获取该页面每行文字信息和坐标
        for (let i = 0; i < blocksArr.length; i++) {
          let block = blocksArr[i];
          let obj = {
            itemstring: "",
            itemconf: ""
          };
          // confidence
          console.log(block["property"]["detectedLanguages"].confidence);
          if (
            block["property"] &&
            block["property"]["detectedLanguages"] &&
            block["property"]["detectedLanguages"].confidence
          ) {
            obj.itemconf = block["property"]["detectedLanguages"].confidence;
          }
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
          googleItems.push(obj);
          //使用canvas绘制识别出的文本行在原图中矩形框
        }
      }
      return googleItems;
    },
    // 确认识别
    confirmDetect() {
      //将this.editImageArr里保存的数据取出来，转换对应区域图片
      //判断editImageArr当前是否只有一个区域数据，如果只有一个，用户切换识别类型的时候需要更改对应的type
      let imgArr = this.editImageArr;
      if (imgArr.length == 1) {
        //矫正当前识别类型,以免用户误解
        imgArr[0].type = this.type;
      }
      // 这里有时候，用户明明已经编辑了区域，却还是提示！！！可能有些问题
      if (imgArr.length == 0) {
        this.$notify({
          title: this.$t("warning-text"),
          type: "warning",
          message: this.$t("at-least-one-area")
        });
        return;
      }
      this.resDetectDataArr = [];
      this.userDataImage = [];
      this.userCustomizeArr = [];
      //转换
      // 图片裁剪:drawImage方法的功用是对图像进行裁剪。drawImage(image,sourceX,sourceY,sourceWidth,sourceHeight,destX,destY,destWidth, destHeight)
      // 把它想成从原图中取出一个矩形区域，然后把它画到画布上目标区域里
      //  canvas.toDataURL('image/jpeg'),默认保存png，可以传入image/jpeg
      //userCustomizeArr
      let image = new Image();
      // imageUrl保存的是上传的图片地址，如果用户旋转之后已经改变了原图
      //看图片有没有旋转过
      if (this.deg == 0) {
        image.src = this.imageUrl;
      } else {
        image.src = this.base64ImageData;
      }

      //保存对应生成图片数据
      for (let i = 0; i < imgArr.length; i++) {
        let item = imgArr[i];
        let { x, y, width, height, type } = item;
        let obj = {};
        let canvas = document.createElement("canvas"); //创建canvas元素
        canvas.setAttribute("width", width);
        canvas.setAttribute("height", height);
        let ctx = canvas.getContext("2d");
        ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
        // 将canvas转化base64
        obj.image = canvas.toDataURL("image/jpeg");
        let dataurl = obj.image;
        // 将canvas转换的图片，保存到数组中userDataImage，后面请求接口返回的数据，可以对应展示
        // this.userDataImage["nri" + type] = dataurl;
        this.userDataImage.push({ imgUrl: dataurl });
        // 按照接口对参数的要求，不需要拓展名
        obj.image = dataurl.substring(dataurl.indexOf(",") + 1);
        obj.request_id = Date.now() + "";
        obj.appid = "nri_" + type; //管理员分配,字符串,比userDataImage里的type多了nri前缀
        this.userCustomizeArr.push(obj);
      }
      //将数据传到后台接口，处理，识别
      if (this.isRequesting) {
        return;
      }
      this.isRequesting = true;
      api.smokeIdentificationApi
        .userCustomizeImgDetection(this.userCustomizeArr)
        .then(res => {
          this.isRequesting = false;
          if (res.status == 200) {
            let resDataArr = res.data.data;
            // 遍历处理相关数据
            for (let i = 0; i < resDataArr.length; i++) {
              let item = resDataArr[i];
              let resObj = {};
              if (item.type != "nri_T_general") {
                //针对腾讯优图通用返回不一样数据结构处理
                if (item.code == 0) {
                  resObj.code = item.code;
                  resObj.type = item.type;
                  resObj.text = item.data.text;
                  resObj.confidence = item.data.confidence;
                  resObj.width = item.data.width;
                  resObj.height = item.data.height;
                } else {
                  if (item.statusCode == 404) {
                    //友好话用户提示，目前404这种直接提示联系开发人员
                    resObj.code = 404;
                  } else {
                    resObj.code = -1;
                  }
                  resObj.type = item.type; //返回来的type,和appid一致,添加了nri前缀
                  resObj.text = item.message; //没有识别成功,text赋值为messge
                  resObj.confidence = 0;
                }
              } else if (item.type == "nri_T_general") {
                //处理腾讯通用应刷题识别
                resObj.type = item.type;
                resObj.text = item.items;
                resObj.code = item.items.length != 0 ? 0 : -1; //如果有数据，code=0
                //计算平均准确度
                let avg_confidence = 0.0;
                item.items.forEach(value => {
                  avg_confidence += Number(value.itemconf);
                  value.itemconf = Number(value.itemconf).toFixed(2);
                });
                if (item.items.length != 0) {
                  avg_confidence = (avg_confidence / item.items.length).toFixed(
                    2
                  );
                }
                resObj.confidence = avg_confidence * 100;
              }
              // 处理谷歌通用印刷体识别
              if (item.type == "nri_G_general") {
                resObj.type = item.type;
                resObj.text = this.handleGoogleOcrData(item);
                // 平均值
                let avg_confidence = 0.0;
                resObj.text.forEach(value => {
                  avg_confidence += Number(value.itemconf);
                  value.itemconf = Number(value.itemconf).toFixed(2);
                });
                if (resObj.text.length != 0) {
                  avg_confidence = (
                    avg_confidence / resObj.text.length
                  ).toFixed(2);
                }
                resObj.confidence = avg_confidence * 100;
                //获取针对该页面的一个总的confidence
                if (resObj.text.length != 0) {
                  resObj.code = 0; //有数据
                } else if (resObj.text.length == 0) {
                  resObj.code = 1; //无数据
                } else {
                  resObj.code = -1; //报错
                }
              }
              this.resDetectDataArr.push(resObj);
            }

            //合并之前保存好的base64图片数据
            let resDetectDataArrCp = this.resDetectDataArr;
            for (let i = 0; i < resDetectDataArrCp.length; i++) {
              let item = resDetectDataArrCp[i];
              item.imgUrl = this.userDataImage[i].imgUrl;
            }
            this.resDetectDataArr = resDetectDataArrCp;
          }
        })
        .catch(() => {
          this.isRequesting = false;
          this.result = this.$t("recognition-fail");
        });
    }
  }
};
</script>
