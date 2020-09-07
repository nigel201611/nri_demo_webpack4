<!--
 * @Descripttion: 用户自定区域识别OCR
 * @Author: nigel
 * @Date: 2020-05-06 18:09:34
 * @LastEditTime: 2020-09-07 10:58:41
 -->
<i18n src="./locals/index.json"></i18n>
<template>
  <div class="ocr-wrap">
    <el-upload
      ref="upload"
      class="upload-demo"
      action="https://imageregdemo.nrihkerp.com"
      :before-upload="beforeRead"
      :disabled="uploadImgLoading"
      :show-file-list="false"
      accept="image/jpg, image/jpeg, image/png"
      :on-success="handleUploadSuccess"
    >
      <el-button
        :loading="uploadImgLoading"
        class="upload_btn"
        size="small"
        type="primary"
      >{{ $t('upload-btn-text') }}</el-button>
    </el-upload>

    <div class="btn-list">
      <el-row class="choice-type">
        <el-button
          :disabled="!imageUrl"
          type="success"
          size="small"
          :loading="isRequesting"
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
          @click="handleClearArea"
        >{{ $t('clear-area') }}</el-button>
      </el-row>

      <el-row v-show="imageUrl" class="image-btn">
        <el-button
          :title="$t('rotate')"
          type="info"
          size="mini"
          class="fa fa-rotate-right"
          @click="handleClockwise"
        />
        <el-button
          :disabled="deg==-360"
          :title="$t('anticlock-rotate')"
          type="info"
          size="mini"
          class="fa fa-rotate-left"
          @click="handleAnticlockwise"
        />
        <el-button
          :title="$t('scale-pic')"
          type="info"
          size="mini"
          class="fa fa-search-plus"
          @click="handleEnlarge"
        />
        <el-button
          :title="$t('zooms-in')"
          type="info"
          size="mini"
          class="fa fa-search-minus"
          @click="handleShrink"
        />
        <el-button
          :title="$t('reset-btn')"
          class="fa fa-hand-stop-o"
          :disabled="!imageUrl"
          type="primary"
          size="mini"
          @click="handleReset"
        />
      </el-row>
    </div>
    <!-- 如果匹配到了模板，提示给用户，由用户决定是否直接识别显示结果 -->
    <!-- <el-dialog
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :title="$t('confirm-dialog-title')"
      :visible.sync="tempMatchingDialog"
      width="30%"
    >
      <span>{{ $t('confirm-dialog-tip') }}</span>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" type="warning" @click="handleNoTip">{{ $t('no-tip') }}</el-button>
        <el-button size="mini" @click="tempMatchingDialog = false">{{ $t('dialog-cancel-btn') }}</el-button>
        <el-button
          size="mini"
          type="primary"
          @click="handleConfirmMatching"
        >{{ $t('dialog-confirm-btn') }}</el-button>
      </span>
    </el-dialog>-->
    <!-- 保存用户上传的原图 -->
    <img ref="imgElem" class="imgElem" :height="bill_height" :width="bill_width" :src="imageUrl" />
    <!-- 可以供用户自定义区域 -->
    <div
      v-loading="calibrating"
      :element-loading-text="$t('during-calibration')"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.6)"
      class="usercustomize_area"
    >
      <div class="img_background_wrap">
        <div
          ref="imgEdit"
          :element-loading-text="$t('customize-area-loading-tip')"
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(0, 0, 0, 0.6)"
          class="img-wrap"
          :style="imgObj"
        />
      </div>
    </div>
    <!-- 展示自定义区域识别结果 -->
    <div v-if="resDetectDataArr.length" class="result_wrap">
      <el-card v-for="(item,index) in resDetectDataArr" :key="index" class="box-card">
        <!-- <div slot="header" class="clearfix box-card_header">
          <span>{{ $t(resTitleArr[item.type]) }}</span>
        </div>-->
        <div class="text item">
          <div class="item_img">
            <!-- <span>{{ $t(resTitleArr[item.type]) }}</span> -->
            <img :class="'block_bg'+' border_'+item.type" :src="item.imgUrl" />
          </div>

          <!-- item.code=0,有时候返回的text是空的，要做下处理 -->
          <p v-if="item.code==0&&item.type!='nri_T_general'&&item.type!='nri_G_general'">
            <el-table :data="item.text" style="width: 100%">
              <el-table-column type="index" width="50" />
              <el-table-column prop="itemstring" :label="$t('recog_result')" align="left" />
              <!-- <el-table-column prop="itemconf" :label="$t('recog_confidence')" align="left" /> -->
              <el-table-column
                width="120"
                prop="itemconf"
                :label="$t('recog_confidence')"
                align="left"
              >
                <template slot-scope="scope">
                  <span>{{ scope.row.itemconf }}%</span>
                </template>
              </el-table-column>
            </el-table>
          </p>
          <p v-else-if="item.code==0&&item.type=='nri_T_general'">
            <el-table :data="item.text" style="width: 100%">
              <el-table-column type="index" width="50" />
              <el-table-column prop="itemstring" :label="$t('recog_result')" align="left" />
              <!-- <el-table-column prop="itemconf" :label="$t('recog_confidence')" align="left" /> -->
              <el-table-column
                width="120"
                prop="itemconf"
                :label="$t('recog_confidence')"
                align="left"
              >
                <template slot-scope="scope">
                  <span>{{ (scope.row.itemconf *100).toFixed(2) }}%</span>
                </template>
              </el-table-column>
            </el-table>
          </p>
          <p v-else-if="item.code==0&&item.type=='nri_G_general'">
            <el-table :data="item.text" style="width: 100%">
              <el-table-column type="index" width="50" />
              <el-table-column prop="itemstring" :label="$t('recog_result')" align="left" />
              <!-- <el-table-column prop="itemconf" :label="$t('recog_confidence')" align="left" /> -->
              <el-table-column
                width="120"
                prop="itemconf"
                :label="$t('recog_confidence')"
                align="left"
              >
                <template slot-scope="scope">
                  <span>{{ (scope.row.itemconf *100).toFixed(2) }}%</span>
                </template>
              </el-table-column>
            </el-table>
          </p>
          <p v-else-if="item.code==1&&item.type=='nri_G_general'">
            <el-table :data="item.text" style="width: 100%">
              <el-table-column type="index" width="50" />
              <el-table-column prop="itemstring" :label="$t('recog_result')" align="left" />
              <el-table-column
                width="120"
                prop="itemconf"
                :label="$t('recog_confidence')"
                align="left"
              >
                <template slot-scope="scope">
                  <span>{{ (scope.row.itemconf *100).toFixed(2) }}%</span>
                </template>
              </el-table-column>
            </el-table>
          </p>
          <p v-else-if="item.code==-1" class="error">{{ $t('reuslt-error') }}</p>
          <p v-else class="error">{{ $t('backend_error') }}</p>
        </div>
      </el-card>
    </div>
    <!-- 用戶自定区域完毕弹出框 -->
    <el-dialog
      :title="$t('custom_region_edit')"
      :visible.sync="dialogCustomBlockVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="30%"
    >
      <el-form ref="customBlockForm" :model="customBlockForm" size="mini" :rules="cutomBlockRules">
        <el-form-item :label="$t('area_name')" prop="name">
          <el-input v-model="customBlockForm.name" auto-complete="off" />
        </el-form-item>
        <el-form-item :label="$t('OCR_engine')" prop="OCR_engine">
          <el-select
            v-model="customBlockForm.OCR_engine"
            :placeholder="$t('select_ocr_engine')"
            size="small"
            clearable
            :disabled="!imageUrl"
            class="detectionList"
            @change="handleChangeSelect"
          >
            <el-option
              v-for="item in btnList"
              :key="$t(item.text)"
              :label="$t(item.text)"
              :value="item.type"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="handleCancelCustomBlock">{{ $t('dialog-cancel-btn') }}</el-button>
        <el-button
          size="mini"
          type="primary"
          @click="handleConfirmCustomBlockOcr('customBlockForm')"
        >{{ $t('dialog-confirm-btn') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from "vuex";
import api from "../../api";
export default {
  data() {
    return {
      dialogCustomBlockVisible: false, //控制自定区域编辑弹出框
      customBlockForm: {
        name: "", //自定区域名称
        OCR_engine: "expressbill", //当前ocr引擎类型,默认运单
      }, //自定块编辑表单
      cutomBlockRules: {
        name: [
          {
            required: true,
            message: "Please enter a custom area name",
            trigger: "blur",
          },
        ],
        OCR_engine: [
          {
            required: true,
            message: "Please select OCR engine",
            trigger: "change",
          },
        ],
      },
      isRequesting: false, //控制请求次数和加载状态
      imageUrl: "",
      btnList: [
        { flag: false, text: "address_bill_dectect", type: "expressbill" },
        { flag: false, text: "postcode_dectect", type: "postcode" },
        { flag: false, text: "name_dectect", type: "name" },
        { flag: false, text: "T_general", type: "T_general" },
        { flag: false, text: "G_general", type: "G_general" },
      ], //用于保存类型功能按钮
      resTitleArr: {
        nri_expressbill: "waybill-result",
        nri_postcode: "zipcode-result",
        nri_T_general: "T_general",
        nri_G_general: "G_general",
      }, //保存标题和识别类型映射关系，
      imgObj: {
        background: `url(${this.imageUrl}) no-repeat 0 0`,
        backgroundSize: "cover",
        width: this.bill_width + "px",
        height: this.bill_height + "px",
        transform: "rotate(0)",
      },
      confidence: "", //識別準確率
      bill_width: "680", //運單默認寬度
      bill_height: "400", //運單默認高度
      result: "", //图片识别结果
      dialogVisible: false, //控制对话框关闭
      type: "expressbill", //标识当前识别类型
      origin: {
        x: 0,
        y: 0,
      }, //鼠标刚开始按下的点
      deg: 0, //旋转的角度，默认从0度开始
      uploadImgLoading: false, //用于控制图片上传时有一个加载动效
      // endpoint: { x: 0, y: 0 }, //鼠标移动后终点坐标
      resDetectDataArr: [], //自定区域识别后返回的数据
      tempMatchingDialog: false, //用于控制是否加载上次保存过的自定义区域数据标识
      calibrating: false,
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
    this.editImageArr = []; //保存用户自定区域坐标原点和宽高{x:0,y:0,width:100,height:100}
    this.userCustomizeArr = []; //保存用户自定区域相关参数
    this.userDataImage = []; //保存用户自定区域base64数据,后面用于拼接到resDetectDataArr，展示数据
    this.TemplateData = []; //保存模板数据，模板里可能包含多个自定区域数据 blockItem:[{"block_id":"20200901181925pwxa1jykfid","name":"地址","ocr_engine":"expressbill","block":{"x":93,"y":176,"width":235,"height":113}}]
    this.curPoints = null; //当前用户自定区域数据{x,y,width,height}
    this.startXY = { x: 0, y: 0 }; //保存用户按下鼠标起点x,y注意和offsetX区别
    this.endXY = { x: 0, y: 0 }; //保存用户按下鼠标终点x,y注意和offsetX区别，和startXY一起用于准确计算宽高
    this.dragInfoWidthHeight = {
      width: 0,
      height: 0,
    };
    // 提前创建好canvas元素
    this.myCanvas = document.createElement("canvas");
    this.myCtx = this.myCanvas.getContext("2d");
    this.OriginImageUrl = ""; //保存用户上传未处理的图片数据
    this.scaleMini = 1; //缩小比例
    this.scaleMax = 1; //放大比例
    this.curDiv = null; //保存当前绘制的框图
    this.editCustomBlockFlag = false; //标识是否二次修改自定区域
    this.curId = ""; //标识当前修改的id
    this.blockItem = null; //标识当前根据id找到的自定区域块数据
    this.matchTemplateItem = null; //模板匹配命中其中一个模板数据
    //查看是否是从我的模板跳过来的
    this.myTemplateData = this.$route.params; //$route代表当前匹配到的路由记录，注意和$router区别
    this.handleMyTemplateEdit();
    this.calibrating = false;
  },
  destroyed() {
    URL.revokeObjectURL(this.imageUrl);
  },
  methods: {
    /**
     * @name: initEvent
     * @msg: 初始化相关事件
     * @param {}
     * @return:
     */
    handleMyTemplateEdit() {
      if (JSON.stringify(this.myTemplateData) != "{}") {
        let oBox = this.$refs.imgEdit;
        oBox.setAttribute("data-temp_id", this.myTemplateData.temp_id);
        //显示图片
        let image = this.myTemplateData.image;
        this.imageUrl = image;
        let imageElem = new Image();
        imageElem.onload = () => {
          this.bill_width = imageElem.width;
          this.bill_height = imageElem.height;
          this.imgObj = {
            background: `url(${image}) no-repeat 0 0`,
            backgroundSize: "cover",
            width: this.bill_width + "px",
            height: this.bill_height + "px",
            transform: "rotate(0)",
          };

          this.removeEditableFunc();
          // 添加框图或者自定义图片区域相关事件
          this.addEditableFunc();
          this.initEvent();
          this.requestOcrEngine(this.myTemplateData.blockItem);
        };
        imageElem.src = image;
      }
    },
    initEvent() {
      let oBox = this.$refs.imgEdit;
      //rect_item
      oBox.onclick = (ev) => {
        let { target } = ev;
        if (target.className.indexOf("rect_item") > -1) {
          //可以重新打开自动区域编辑模态框
          this.curId = target.id;
          this.blockItem = this.TemplateData.find(function (item) {
            return item.block_id == target.id;
          });
          this.customBlockForm.name = this.blockItem.name;
          this.customBlockForm.OCR_engine = this.blockItem.ocr_engine;
          // this.changeCurDivBg(target, this.customBlockForm.OCR_engine);
          this.curDiv = target;
          this.dialogCustomBlockVisible = true;
          this.editCustomBlockFlag = true;
        }
      };
    },
    /**
     * @name: addEditableFunc
     * @msg: 为用户自定区域添加相关事件，初始化
     * @param {}
     * @return:
     */
    addEditableFunc() {
      let oBox = this.$refs.imgEdit;
      //鼠标按下，获取初始点
      oBox.onmousedown = (ev) => {
        //事件延迟性，如果用户框选了区域后，再次选择识别类型下拉框，这里的this.type还是上次的，并没有及时获取到
        //那么需要提示用户选择对应类型
        ev = ev || window.event;
        let { target } = ev;
        if (target.className == "img-wrap") {
          //1.获取按下的点
          let x1 = ev.offsetX;
          let y1 = ev.offsetY;
          //记录鼠标按下的点
          this.origin = {
            x: x1,
            y: y1,
          };
          // console.log(x1,y1);
          this.startXY = {
            x: ev.x,
            y: ev.y,
          };
          // 初始化当前拖拽尺寸
          this.dragInfoWidthHeight = { width: 0, height: 0 };
          this.editCustomBlockFlag = false;
          //2.创建div
          let oDiv = document.createElement("div");
          this.curDiv = oDiv;
          oDiv.setAttribute("class", "rect_item");
          oBox.onmousemove = (e) => {
            // 会不断触发
            e = e || window.event;
            // let x2 = e.offsetX;
            // let y2 = e.offsetY;
            this.endXY = {
              x: e.x,
              y: e.y,
            };
            let x1 = this.origin.x,
              y1 = this.origin.y;
            // 鼠标移动的点处理，为啥往右下移动过程中，横坐标会变小,offsetX有问题
            let width = Math.abs(this.endXY.x - this.startXY.x);
            let height = Math.abs(this.endXY.y - this.startXY.y);
            //对width和height做限制至少大于25
            this.dragInfoWidthHeight = {
              width,
              height,
            };
            //3.设置div的样式,2,61分别矫正位置用
            oDiv.style.left = x1 + "px";
            oDiv.style.top = y1 + "px";
            oDiv.style.width = width + "px";
            oDiv.style.height = height + "px";
            oDiv.style.border = "2px solid #409EFF";
            oDiv.style.background = "rgba(64,158,255,0.4)";
            oDiv.style.position = "absolute";
            // this.endpoint = {
            //   x: x2,
            //   y: y2,
            // };
            oBox.appendChild(oDiv);
            if (width <= 30) {
              oBox.removeChild(oDiv);
            }
          };

          oBox.onmouseup = () => {
            let x1 = this.origin.x,
              y1 = this.origin.y;
            // 记录用户自定义区域的原点和宽高
            // 对width和height做限制,至少大于25
            let { width, height } = this.dragInfoWidthHeight;
            if (width > 30) {
              let pointsInfo = {
                x: x1,
                y: y1,
                width: width,
                height: height,
              };
              this.curPoints = pointsInfo;
              //弹出自定区域编辑
              //用户点击下也会触发，需要处理
              this.dialogCustomBlockVisible = true;
            }
          };
        }
      };
      //在鼠标抬起后终止onmousemove事件
      document.onmouseup = function () {
        oBox.onmousemove = null;
        oBox.onmouseup = null;
      };
    },
    /**
     * @name:removeEditableFunc
     * @msg: 清理相关事件和数据
     * @param {}
     * @return:
     */
    removeEditableFunc() {
      let oBox = this.$refs.imgEdit;
      oBox.innerHTML = "";
      oBox.onmousemove = null;
      oBox.onmouseup = null;
      oBox.onmousedown = null;
    },
    /**
     * @name: blobToDataURL
     * @msg: 将二进制图片转换成base64,blob to dataURL
     * @param {fileblob,callback}
     * @return:FileReader
     */
    blobToDataURL(fileblob, callback) {
      let filereader = new FileReader();
      filereader.onload = function (e) {
        callback(e.target.result);
      };
      filereader.readAsDataURL(fileblob);
      return filereader;
    },
    dataURLtoFile(dataurl, filename) {
      let arr = dataurl.split(","),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    },
    /**
     * @name: handleReset
     * @msg: 重置相关数据
     * @param {}
     * @return:
     */
    handleReset() {
      this.deg = 0;
      let oBox = this.$refs.imgEdit;
      oBox.innerHTML = "";
      this.editImageArr = []; //保存用户自定区域坐标原点和宽高以及类型{x:0,y:0,width:100,height:100}
      this.userCustomizeArr = []; //保存用户自定区域转换处理后参数
      this.scaleMax = 1;
      this.imageUrl = this.OriginImageUrl;
      this.imgObj.background = `url(${this.imageUrl}) no-repeat 0 0`;
      this.imgObj.transform = `scale(1)`;
    },
    /**
     * @name: handleUploadSuccess
     * @msg: 图片上传成功回调
     * @param {res,file}
     * @return:
     */
    handleUploadSuccess(res, file) {
      //先删除之前添加的框图事件，以免重复添加
      this.removeEditableFunc();
      // 添加框图或者自定义图片区域相关事件
      this.addEditableFunc();
      this.initEvent();
      // 关闭加载进度
      this.uploadImgLoading = false;
      // 通过URL.createObjectURL生成零时用图片链接
      // 在上传成功后，根据imageUrl通过canvas生成base64,方便以后真实放大旋转图片用
      // 这样在框图的时候也是框的真实图片数据
      this.imageUrl = URL.createObjectURL(file.raw);
      //上传成功调用校准接口校准下图片，file.raw
      this.calibrationImage(file);
      this.OriginImageUrl = this.imageUrl;
      this.base64ImageData = "";
      this.imgObj = {
        background: `url(${this.imageUrl}) no-repeat 0 0`,
        backgroundSize: "cover",
        width: this.bill_width + "px",
        height: this.bill_height + "px",
        transform: "rotate(0)",
      };
    },
    // 校准图片
    calibrationImage(file) {
      // 加载图片校准
      if (this.calibrating) {
        return;
      }
      let imgElem = new Image();
      let myCanvas = this.myCanvas;
      let myCtx = this.myCtx;
      imgElem.src = this.imageUrl;
      imgElem.onload = () => {
        let imgWidth = imgElem.width, //上传图片的宽
          imgHeight = imgElem.height, //上传图片的高
          maxWidth = 1024, //图片最大宽
          maxHeight = 1024, //图片最大高
          targetWidth = imgWidth, //最后图片的宽
          targetHeight = imgHeight; //最后图片的高
        // console.log(imgWidth, imgHeight);
        // 如果图片的宽或者高大于图片的最大宽高
        if (imgWidth > maxWidth || imgHeight > maxHeight) {
          // 宽大于高
          if (imgWidth / imgHeight > maxWidth / maxHeight) {
            targetWidth = maxWidth;
            targetHeight = Math.round(maxWidth * (imgHeight / imgWidth));
          }
          // 宽小于高
          else {
            targetHeight = maxHeight;
            targetWidth = Math.round(maxHeight * (imgWidth / imgHeight));
          }
        }
        myCanvas.width = targetWidth; //canvas的宽=图片的宽
        myCanvas.height = targetHeight; //canvas的高=图片的高
        this.bill_width = targetWidth;
        this.bill_height = targetHeight;
        myCtx.clearRect(0, 0, targetWidth, targetHeight); //清理canvas
        myCtx.drawImage(imgElem, 0, 0, targetWidth, targetHeight); //canvas绘图
        // 去掉dll校准，添加此处代码，否则注释掉
        this.imageUrl = myCanvas.toDataURL(file.raw.type);
        this.imgObj = {
          background: `url(${this.imageUrl}) no-repeat 0 0`,
          backgroundSize: "cover",
          width: targetWidth + "px",
          height: targetHeight + "px",
          transform: "rotate(0)",
        };
        // 调用dll校准
        // this.callCalibrateDll(myCanvas,file);
      };
    },

    /**
     * @name: callCalibrateDll
     * @msg: 调用校准dll
     * @param {type}
     * @return:
     */
    callCalibrateDll(myCanvas, file) {
      myCanvas.toBlob(
        (blob) => {
          let myform = new FormData();
          myform.append("file", blob);
          this.calibrating = true;
          api.calibrationApi
            .calibrationImage(myform)
            .then((res) => {
              this.calibrating = false;
              let { status } = res;
              if (status == 200) {
                let { errno } = res.data;
                if (errno == 0) {
                  this.imageUrl = res.data.data.image;
                  //校准后的图片可能需要重新计算宽高
                  let calibratedImg = new Image();
                  calibratedImg.src = this.imageUrl;
                  calibratedImg.addEventListener("load", () => {
                    let { width, height } = calibratedImg;
                    this.bill_width = width;
                    this.bill_height = height;
                    this.imgObj = {
                      background: `url(${this.imageUrl}) no-repeat 0 0`,
                      backgroundSize: "cover",
                      width: width + "px",
                      height: height + "px",
                      transform: "rotate(0)",
                    };
                  });
                } else {
                  //校准出问题
                }
              } else {
                //提示校准失败
              }
              //提示每半个小时将当前图片成功保存本地
            })
            .catch((error) => {
              this.calibrating = false;
              console.log(error);
              //提示用户检查网络连接是否正常
            });
        },
        file.raw.type,
        1
      ); //canvas导出成为base64
    },
    /**
     * @name: beforeRead
     * @msg: 图片上传前校验
     * @param {file}
     * @return:
     */
    beforeRead(file) {
      let imgSize = file.size;
      let maxSize = 5 * 1048576;
      if (imgSize > maxSize) {
        this.$notify({
          title: this.$t("upload-size-error"),
          message: this.$t("upload-size-tip"),
        });
        return false;
      }
      let that = this;
      this.blobToDataURL(file, function (dataurl) {
        let image = new Image();
        image.onload = function () {
          let width = image.width;
          let height = image.height;
          that.bill_width = width;
          that.bill_height = height;
        };
        image.src = dataurl;
      });
      this.result = "";
      this.imageUrl = "";
      this.deg = 0;
      this.imgObj = {
        background: `url(${this.imageUrl}) no-repeat 0 0`,
        backgroundSize: "cover",
        width: this.bill_width + "px",
        height: this.bill_height + "px",
        transform: "rotate(0)",
      };
      // 前面校验通过，显示上传图片加载动效,并将之前上传的数据清空
      let oBox = this.$refs.imgEdit;
      oBox.innerHTML = "";
      this.resetArr();
      // 上传图片加载动态
      this.uploadImgLoading = true;
      return true;
    },
    /**
     * @name: drawRect
     * @msg: 绘制自定区域
     * @param {x1,y1,width,height}
     * @return:
     */
    drawRect(x1, y1, width, height, type) {
      let oDiv = document.createElement("div");
      oDiv.setAttribute("class", "rect_item");
      oDiv.style.left = x1 + "px";
      oDiv.style.top = y1 + "px";
      oDiv.style.width = width + "px";
      oDiv.style.height = height + "px";
      this.changeCurDivBg(oDiv, type);
      // oDiv.style.border = "2px solid #409EFF";
      // oDiv.style.background = "rgba(64,158,255,0.4)";
      oDiv.style.position = "absolute";
      return oDiv;
    },
    /**
     * @name:handleConfirmMatching
     * @msg:确认模板匹配,处理识别结果,是否有必要?每次用户上传图片,弹出这个会不会有点多余?,该页面已去掉
     * @param {type}
     * @return:
     */
    // handleConfirmMatching() {
    //   let blockItems = this.matchTemplateItem.blockItem;
    //   // 调用识别引擎识别显示结果
    //   this.requestOcrEngine(blockItems);
    //   this.tempMatchingDialog = false;
    // },
    /**
     * @name: wrapOcrEngine
     * @msg: ocr引擎请求统一封装
     * @param {}
     * @return:
     */
    wrapOcrEngine(templateData) {
      if (this.isRequesting) {
        return;
      }
      this.isRequesting = true;
      api.smokeIdentificationApi
        .userCustomizeImgDetection(this.userCustomizeArr)
        .then((res) => {
          this.isRequesting = false;
          if (res.status == 200) {
            let resDataArr = res.data.data;
            // 遍历处理相关数据
            for (let i = 0; i < resDataArr.length; i++) {
              let item = resDataArr[i];
              let resObj = {};
              if (
                item.type != "nri_T_general" &&
                item.type != "nri_G_general"
              ) {
                //针对腾讯优图通用返回不一样数据结构处理
                // console.log(item);
                resObj.type = item.type;
                resObj.text = item.items;
                resObj.code = item.items.length != 0 ? 0 : -1; //如果有数据，code=0
                //计算平均准确度
                let avg_confidence = 0.0;
                if (item.items && item.items.length != 0) {
                  item.items.forEach((value) => {
                    avg_confidence += Number(value.itemconf);
                    value.itemconf = Number(value.itemconf).toFixed(2);
                  });
                  avg_confidence = (avg_confidence / item.items.length).toFixed(
                    2
                  );
                }
                // console.log(avg_confidence);
                resObj.confidence = avg_confidence;
              } else if (item.type == "nri_T_general") {
                //处理腾讯通用印刷识别
                resObj.type = item.type;
                resObj.text = item.items;
                resObj.code = item.items.length != 0 ? 0 : -1; //如果有数据，code=0
                //计算平均准确度
                let avg_confidence = 0.0;
                item.items.forEach((value) => {
                  avg_confidence += Number(value.itemconf);
                  value.itemconf = Number(value.itemconf).toFixed(2);
                });
                if (item.items.length != 0) {
                  avg_confidence = (avg_confidence / item.items.length).toFixed(
                    2
                  );
                }
                // console.log(avg_confidence);
                resObj.confidence = avg_confidence * 100;
              }
              // 处理谷歌通用印刷体识别
              if (item.type == "nri_G_general") {
                resObj.type = item.type;
                resObj.text = this.handleGoogleOcrData(item);
                // 平均值
                let avg_confidence = 0.0;
                resObj.text.forEach((value) => {
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
              item.imgUrl = templateData[i].image;
            }
            this.resDetectDataArr = resDetectDataArrCp;
          }
        })
        .catch(() => {
          this.isRequesting = false;
          this.result = this.$t("recognition-fail");
        });
    },
    /**
     * @name: requestOcrEngine
     * @msg: 根据用户自定区域调用引擎识别
     * @param {type}
     * @return:
     */
    requestOcrEngine(blockItems) {
      // 模板数据，如果用户在后面有修改了这个模板数据，修改后保存，应该是更新对应模板数据，而不是新增。
      // 所以需要有一个temp_id判断当前是否已经存在
      if (blockItems.length) {
        this.resDetectDataArr = []; //返回数据
        this.userCustomizeArr = []; //请求参数处理
        let templateData = [];
        this.editImageArr = [];
        let oBox = this.$refs.imgEdit;
        for (let i = 0; i < blockItems.length; i++) {
          let item = blockItems[i];
          // 根据坐标信息转图片 {x: 279, y: 414, width: 218, height: 55}
          let block = item.block;
          let imageData = this.getImageByPointsInfo(block);
          let blockItem = {
            block_id: item.block_id,
            name: item.name,
            ocr_engine: item.ocr_engine,
            block: item.block,
            image: imageData, //保存到数据库或者本地，不需要保存这个字段数据
          };
          // 绘制矩形框
          let oDiv = this.drawRect(
            block.x,
            block.y,
            block.width,
            block.height,
            item.ocr_engine
          );
          oDiv.setAttribute("id", item.block_id);
          oBox.appendChild(oDiv);
          templateData.push(blockItem);
          this.editImageArr.push(block);
          let obj = {};
          obj.image = imageData.substring(imageData.indexOf(",") + 1);
          let nowTime = Date.now() + "";
          obj.request_id = nowTime;
          if (item.ocr_engine == "postcode") {
            obj.options = {
              scene: "postcode",
            };
          }
          obj.type = "nri_" + item.ocr_engine;
          obj.app_id = nowTime; //管理员分配,字符串,比userDataImage里的type多了nri前缀
          this.userCustomizeArr.push(obj);
        }
        this.TemplateData = templateData;
        this.wrapOcrEngine(templateData);
      }
    },
    /**
     * @name: uuid
     * @msg: 生产唯一id
     * @param {}
     * @return:string
     */
    uuid() {
      let date = new Date();
      let y = date.getFullYear();
      let m = date.getMonth() + 1;
      m = m < 10 ? "0" + m : m;
      let d = date.getDate();
      d = d < 10 ? "0" + d : d;
      let h = date.getHours();
      let minute = date.getMinutes();
      let second = date.getSeconds();
      let str = y + m + d + h + minute + second;
      return str + Math.random().toString(36).substr(2);
    },
    /**
     * @name: getImageByPointsInfo
     * @msg: 通过(x,y,width,height)数据获取自定区域图片base64数据
     * @param {}
     * @return:
     */
    getImageByPointsInfo(points) {
      let image = new Image();
      if (this.deg == 0) {
        image.src = this.imageUrl;
      } else {
        image.src = this.base64ImageData;
      }
      let { x, y, width, height } = points;
      let canvas = document.createElement("canvas"); //创建canvas元素
      canvas.setAttribute("width", width);
      canvas.setAttribute("height", height);
      let ctx = canvas.getContext("2d");
      // 裁剪图片
      ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
      // 将canvas转化base64
      return canvas.toDataURL("image/jpeg");
    },
    // 根据用户选择不同ocr引擎，显示不同颜色区域，邮编-紫色，地址-绿色，姓名-红色
    changeCurDivBg(curDiv, OCR_engine) {
      // console.log(curDiv, OCR_engine);
      // { flag: false, text: "address_bill_dectect", type: "expressbill" },
      // { flag: false, text: "postcode_dectect", type: "postcode" },
      // { flag: false, text: "name_dectect", type: "name" },
      // { flag: false, text: "T_general", type: "T_general" },
      // { flag: false, text: "G_general", type: "G_general" },
      let curDivBg = "rgba(64,158,255,0.4)";
      let curBorder = "2px solid #409EFF";
      switch (OCR_engine) {
        case "expressbill":
          curDivBg = "rgba(7,190,20,0.2)";
          curBorder = "2px solid #07be14";
          break;
        case "postcode":
          curDivBg = "rgba(214,1,253,0.2)";
          curBorder = "2px solid #d601fd";
          break;
        case "name":
          curDivBg = "rgba(253,1,1,0.2)";
          curBorder = "2px solid #fd0101";
          break;
      }
      curDiv.style.border = curBorder;
      curDiv.style.background = curDivBg;
    },
    /**
     * @name: handleConfirmCustomBlockOcr
     * @msg: 自定区域ocr编辑确认,将本次用户编辑的信息加入模板对象中保存,{id,name,ocr_engine,image,block:{x,y,width,height}}
     * @param {formName}
     * @return:
     */
    handleConfirmCustomBlockOcr(formName) {
      //动态生成唯一id
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // 将本次用户自定区域数据加入到对象数组中记录
          //判断是否修改，如果是，则修改对应数据，而不是push
          if (!this.editCustomBlockFlag) {
            let pointsInfo = this.curPoints;
            let imageData = this.getImageByPointsInfo(pointsInfo);
            let blockItem = {
              block_id: this.uuid(),
              name: this.customBlockForm.name,
              ocr_engine: this.customBlockForm.OCR_engine,
              block: pointsInfo,
              image: imageData, //保存到数据库或者本地，不需要保存这个字段数据
            };
            this.curDiv.setAttribute("id", blockItem.block_id);
            this.changeCurDivBg(this.curDiv, this.customBlockForm.OCR_engine);
            this.TemplateData.push(blockItem);
            this.editImageArr.push(pointsInfo);
          } else {
            //找到对应需要修改的数据，修改对应name和ocr_engine
            this.blockItem.name = this.customBlockForm.name;
            this.blockItem.ocr_engine = this.customBlockForm.OCR_engine;
            this.changeCurDivBg(this.curDiv, this.customBlockForm.OCR_engine);
          }
          this.dialogCustomBlockVisible = false;
        } else {
          return false;
        }
      });
    },
    /**
     * @name: handleCancelCustomBlock
     * @msg: 取消自定区域编辑,并且需要清理本次自定区域
     * @param {}
     * @return:
     */
    handleCancelCustomBlock() {
      //移除当前绘制的框图
      let oBox = this.$refs.imgEdit;
      // 判断下取消是二次修改
      if (!this.editCustomBlockFlag) {
        oBox.removeChild(this.curDiv);
      }
      this.dialogCustomBlockVisible = false;
    },
    /**
     * @name: handleNoTip
     * @msg: 用户上传图片，会匹配模板，可以单击不再提示，下次上传就不会去匹配模板和弹确认模态框
     * 或者不再提示，下次直接匹配模板，如果有匹配到的话，直接识别显示结果！！
     * @param {}
     * @return:
     */
    handleNoTip() {
      this.tempMatchingDialog = false;
      //清理缓存
      storeSession.remove("templateData");
    },
    /**
     * @name: resetArr
     * @msg: 重置所有数据
     * @param {}
     * @return:
     */
    resetArr() {
      this.removeEditableFunc();
      this.editImageArr = []; //自定区域坐标原点、宽高以及类型{type:'expressbill',x:0,y:0,width:100,height:100}
      this.userCustomizeArr = []; //用户自定区域图片转换处理后相关接口请求参数
      this.resDetectDataArr = []; //自定区域图片识别后返回的数据
      this.TemplateData = [];
    },
    /**
     * @name: saveCustomize
     * @msg: 保存当前用户所有自定区域为模板,上传同样格式的图片，进行模板匹配，存在直接识别显示结果，
     * 用户也可以对保存的模板重新编辑，查看，删除
     * 默认保存当前模板数据到本地缓存，用户上传同样格式图片先和本地缓存对比，命中则不需要和数据库数据对比
     * @param {}
     * @return:
     */
    saveCustomize() {
      //处理保存的数据
      //保存为模板数据到数据库
      // 判斷當前保存模板是新增還是修改,如果temp_id存在則爲修改，否則新增
      let oBox = this.$refs.imgEdit;
      let temp_id = oBox.getAttribute("data-temp_id");
      if (this.editImageArr.length) {
        let blockData = this.TemplateData.map((item) => {
          return {
            block_id: item.block_id,
            name: item.name,
            ocr_engine: item.ocr_engine,
            block: item.block,
          };
        });
        // 用户原图转换base64
        let imgElem = this.$refs.imgElem;
        let { width, height } = imgElem;
        this.myCanvas.width = width;
        this.myCanvas.height = height;
        this.myCtx.drawImage(imgElem, 0, 0, width, height);
        let imgbase64 = this.myCanvas.toDataURL("image/jpeg");
        // 模板数据
        let templateData = {
          temp_id: temp_id || this.uuid(),
          blockItem: blockData,
          image: imgbase64, //用户上传图片base64数据
        };
        // 本地保存一份，数据库保存一份或者更新一份!!!!
        // const templateDataArr = storeSession.get("templateData") || [];
        // 保存templateData到数据库中
        api.userTemplateApi.saveTemplate(templateData).then((res) => {
          //保存成功给出提示
          let { status, data } = res;
          if (status == 200) {
            if (data.data > 0) {
              this.$notify({
                title: this.$t("tip-text"),
                message: this.$t("save-succ"),
              });
            } else if (data.data == -1) {
              //提示已经超过保存模板数量限制，最多保存10个模板，请删除旧再试
              this.$notify({
                title: this.$t("tip-text"),
                message: this.$t("over_limit"),
              });
            } else {
              //提示保存失败，请尝试重新保存！！！！
              this.$notify({
                title: this.$t("tip-text"),
                message: this.$t("save-fail"),
              });
            }
          }
        });
        // 寻找当前保存的模板数据中是否有和temp_id相同的，有则更新替换
        // let tempItem = null;
        // if (temp_id) {
        //   tempItem = templateDataArr.find((item) => {
        //     return (item.temp_id = temp_id);
        //   });
        // }
        // //说明找到该项,替换
        // if (tempItem) {
        //   tempItem.temp_id = temp_id;
        //   tempItem.blockItem = templateData.blockItem;
        //   tempItem.image = templateData.image;
        // } else {
        //   //没有找到，直接推入
        //   // console.log('新增');
        //   templateDataArr.push(templateData);
        // }
        oBox.setAttribute("data-temp_id", templateData.temp_id);
        // 如果用户当前保存太多模板数据，由于原图base64较大，有可能造成本地缓存不够，需要考虑下是否限制保存的数量
        // 限制保存10个模板，后面如果需要再开启更多
        // 将数据添加到数据库里
        // storeSession.set("templateData", templateDataArr);
        // this.$notify({
        //   title: this.$t("tip-text"),
        //   message: this.$t("save-succ"),
        // });
      } else {
        this.$notify({
          title: this.$t("tip-text"),
          message: this.$t("no-cur-area"),
        });
      }
    },
    /**
     * @name: handleClearArea
     * @msg:清除用户所有自定区域
     * @param {}
     * @return:
     */
    handleClearArea() {
      this.btnList.map((item) => {
        return (item.flag = false);
      });
      //清除盒子下新增的子节点
      let oBox = this.$refs.imgEdit;
      oBox.innerHTML = "";
      this.editImageArr = [];
      this.TemplateData = [];
    },
    /**
     * @name: handleGoogleOcrData
     * @msg: 处理谷歌通用印刷体识别
     * @param {resData}
     * @return: googleItems
     */
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
            itemconf: "",
          };
          // confidence
          if (block["property"] && block["property"]["detectedLanguages"]) {
            // block["property"]["detectedLanguages"][0].confidence || 1; //没有默认给个1?
            obj.itemconf =
              block["property"]["detectedLanguages"][0].confidence || 0;
          }
          // 里面保存了每段或者每行的所有字符，将他们串联起来，保存到itemstring里
          let paragraphs = block.paragraphs[0];
          let words = paragraphs.words;
          obj.itemstring = words.reduce((total, word) => {
            let symbols = word.symbols;
            symbols.forEach((element) => {
              total += element.text;
            });
            return total;
          }, "");
          googleItems.push(obj);
        }
      }
      return googleItems;
    },
    /**
     * @name: confirmDetect
     * @msg:  确认识别
     * @param {}
     * @return:
     */
    confirmDetect() {
      //判断editImageArr当前是否只有一个区域数据，如果只有一个，用户切换识别类型的时候需要更改对应的type
      let imgArr = this.editImageArr; //[{x,y,width,height}]
      let templateData = this.TemplateData;
      // 判断当前用户是否有自定区域
      if (imgArr.length == 0) {
        this.$notify({
          title: this.$t("warning-text"),
          type: "warning",
          message: this.$t("at-least-one-area"),
        });
        return;
      }
      this.resDetectDataArr = []; //返回数据
      this.userCustomizeArr = []; //请求参数处理
      //图片裁剪:drawImage方法的功用是对图像进行裁剪。drawImage(image,sourceX,sourceY,sourceWidth,sourceHeight,destX,destY,destWidth, destHeight)
      //把它想成从原图中取出一个矩形区域，然后把它画到画布上目标区域里
      let nowTime = Date.now() + "";
      for (let i = 0; i < templateData.length; i++) {
        let item = templateData[i];
        let image = item.image;
        let obj = {};
        obj.image = image.substring(image.indexOf(",") + 1);
        obj.session_id = nowTime;
        if (item.ocr_engine == "postcode") {
          obj.options = {
            scene: "postcode",
          };
        }
        obj.type = "nri_" + item.ocr_engine;
        obj.app_id = nowTime; //管理员分配,字符串,比userDataImage里的type多了nri前缀
        this.userCustomizeArr.push(obj);
      }
      this.wrapOcrEngine(templateData);
    },

    /**图片操作，旋转，缩放 */
    /**
     * @name: rotateCanvasDeg
     * @msg: 通过canvas旋转图片,在转换图片toDataURL("image/jpeg");用户自定区域得到的数据才会准确
     * @param {type}
     * @return:
     */
    rotateCanvasDeg() {
      let imgElem = this.$refs.imgElem;
      let width = imgElem.width;
      let height = imgElem.height;
      this.myCanvas.width = width;
      this.myCanvas.height = height;
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
    /**
     * @name: handleClockwise
     * @msg: 顺时针旋转图片
     * @param {}
     * @return:
     */
    handleClockwise() {
      this.deg++;
      this.deg %= 360;
      let curImageUrl = this.rotateCanvasDeg(this.deg);
      //保存每次旋转后的图片数据，base64
      this.base64ImageData = curImageUrl;
      this.imgObj.background = `url(${curImageUrl}) no-repeat 0 0`;
    },
    /**
     * @name: handleAnticlockwise
     * @msg: 逆时针旋转图片
     * @param {}
     * @return:
     */
    handleAnticlockwise() {
      this.deg--;
      this.deg %= 360;
      let curImageUrl = this.rotateCanvasDeg(this.deg);
      //保存每次旋转后的图片数据，base64
      this.base64ImageData = curImageUrl;
      this.imgObj.background = `url(${curImageUrl}) no-repeat 0 0`;
    },
    /**
     * @name: handleEnlarge
     * @msg: 图片放大
     * @param {}
     * @return:
     */
    handleEnlarge() {
      this.scaleMax += 0.01;
      if (this.scaleMax >= 1.5) {
        //最大1.5倍
        this.scaleMax = 1;
        this.$notify({
          title: this.$t("tip-text"),
          message: this.$t("scale-max-tip"),
        });
        return false;
      }
      let scale = this.scaleMax;
      this.imgObj.transform = `scale(${scale})`;
    },
    /**
     * @name: handleShrink
     * @msg:图片缩小
     * @param {type}
     * @return:
     */
    handleShrink() {
      this.scaleMax -= 0.01;
      // 在原来的基础上缩小
      if (this.scaleMax < 1) {
        //最大2.5倍
        this.scaleMax = 1;
        this.$notify({
          title: this.$t("tip-text"),
          message: this.$t("scale-min-tip"),
        });

        return false;
      }
      let scale = this.scaleMax;
      this.imgObj.transform = `scale(${scale})`;
    },
    /**
     * @name: handleChangeSelect
     * @msg: 改变ocr引擎,type代表ocr engine
     * @param {type}
     * @return:
     */
    handleChangeSelect(type) {
      this.type = type;
    },
  },
};
</script>

<style lang="scss" scoped>
.ocr-wrap {
  min-width: 1440px;
  box-sizing: border-box;
  padding: 30px 0 0 20px;
  overflow: hidden;
  .preview_btn {
    margin: 0 10px 0 0;
  }
  .imgElem {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    transform-origin: 50% 50%;
    opacity: 0;
  }
  .usercustomize_area {
    position: relative;
    float: left;
    clear: both;
    .img_background_wrap {
      width: 800px;
      height: 80vh;
      box-sizing: border-box;
      overflow: auto;
      background-color: #fff;
      border: 1px solid #ebeef5;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }
    .img_background_wrap::-webkit-scrollbar {
      /*滚动条整体样式*/
      width: 8px; /*高宽分别对应横竖滚动条的尺寸*/
      height: 8px;
    }
    .img_background_wrap::-webkit-scrollbar-thumb {
      /*滚动条里面小方块*/
      border-radius: 10px;
      background: rgba(0, 0, 0, 0.2);
    }
    // .img_background_wrap::-webkit-scrollbar-track {
    //   /*滚动条里面轨道*/
    //   box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
    //   border-radius: 2px;
    //   background: #ededed;
    // }
    // .img_background_wrap::-webkit-scrollbar-button {
    //   background-color: #409EFF;
    // }
    // .img_background_wrap::-webkit-scrollbar-corner {
    //   background: transparent;
    // }
  }
  .img-wrap {
    position: relative;
    margin: 0 30px 10px 0;
    cursor: crosshair;
    float: left;
    .rect_item {
      z-index: 99999;
      // background: rgba(#409eff, $alpha: 1);
      // border: 2px solid #409eff;
    }
    // overflow-x: auto;
  }
  .upload-demo {
    float: left;
  }
  .btn-list {
    // margin: 0 0 80px 0;
    // padding: 0 0 80px 0;
    float: left;
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
    box-sizing: border-box;
    background-color: #fff;
    // border: 1px solid #ebeef5;
    // box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    width: 600px;
    height: 80vh;
    overflow: auto;
    margin: 0 0 0 20px;
    .block_bg {
      border: 2px solid #409eff;
    }
    .border_nri_postcode {
      border: 2px solid #d601fd;
    }
    .border_nri_expressbill {
      border: 2px solid #07be14;
    }
    .border_nri_name {
      border: 2px solid #fd0101;
    }
    // margin: 0 0 0 30px;
  }
  .result_wrap::-webkit-scrollbar {
    /*滚动条整体样式*/
    width: 8px; /*高宽分别对应横竖滚动条的尺寸*/
    height: 8px;
  }
  .result_wrap::-webkit-scrollbar-thumb {
    /*滚动条里面小方块*/
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.2);
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
