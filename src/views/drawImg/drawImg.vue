<!--
 * @Author: nigel
 * @Date: 2020-03-19 17:42:36
 * @LastEditTime: 2020-09-08 09:32:00
--> 
<i18n src="./locals/index.json"></i18n>
<template>
  <div class="ocr-wrap">
    <el-upload
      ref="upload"
      class="upload-demo"
      action="https://imageregdemo.nrihkerp.com"
      :before-upload="beforeRead"
      :show-file-list="false"
      :disabled="uploadImgLoading"
      accept="image/jpg, image/jpeg, image/png"
      :on-success="handleUploadSuccess"
    >
      <el-button
        :loading="uploadImgLoading"
        class="upload_btn"
        size="small"
        type="primary"
      >{{ $t('upload-btn-text') }}</el-button>
      <span class="tip">{{ $t('upload-btn-tip') }}</span>
    </el-upload>

    <div class="btn-list">
      <el-row class="choice-type">
        <el-select
          v-model="template_id"
          size="small"
          :no-data-text="$t('no_data')"
          :disabled="!imageUrl"
          class="detectionList"
          :placeholder="$t('upload-placehoder')"
          @change="handleChangeSelect"
        >
          <el-option
            v-for="item in templateDataArr"
            :key="item.temp_id"
            :label="item.temp_id"
            :value="item.temp_id"
          />
        </el-select>

        <el-button
          :disabled="!imageUrl"
          :loading="isRequesting"
          type="success"
          size="small"
          @click="confirmDetect"
        >{{ $t('confirm-detect') }}</el-button>
      </el-row>
    </div>

    <!-- 可以供用户自定义区域 -->
    <div
      v-loading="calibrating"
      :element-loading-text="$t('during-calibration')"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.6)"
      class="usercustomize_area"
    >
      <div ref="imgEdit" class="img-wrap" :style="imgObj" />
      <!-- 展示自定义区域识别结果 -->
      <div v-if="resDetectDataArr.length" class="result_wrap">
        <el-card v-for="(item,index) in resDetectDataArr" :key="index" class="box-card">
          <!-- <div slot="header" class="clearfix box-card_header">
            <span>{{ $t(resTitleArr[item.type]) }}</span>
          </div>-->
          <div class="text item">
            <!-- 根据类型，加上对应区分边框 -->
            <!-- <span>{{ $t(resTitleArr[item.type]) }}</span> -->
            <img :class="'block_bg'+' border_'+item.type" :src="item.imgUrl" />
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
            <p v-else-if="item.code==-1" class="error">{{ $t('reuslt-error') }}</p>
            <p v-else class="error">{{ $t('backend_error') }}</p>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import api from "../../api";
export default {
  data() {
    return {
      isRequesting: false, //控制请求次数和加载状态
      calibrating: false,
      uploadImgLoading: false, //用于控制图片上传时有一个加载动效
      imageUrl: "",
      templateDataArr: [], //模板对象数据
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
      template_id: "", //默认显示的模板id，后面改为模板名称
      resDetectDataArr: [], //自定义区域图片识别后返回的数据
      editImageArr: [], //用于保存用户自定义类型的区域坐标原点和宽高以及类型{type:'expressbill',x:0,y:0,width:100,height:100}--目前只考虑每个类型只能自定义一个区域
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
    this.userCustomizeArr = []; //用于保存用户自定义区域图片相关发送接口请求参数
    this.userDataImage = []; //用于保存用户自定义区域图片base64数据,后面用于拼接到resDetectDataArr，用于展示界面数据
    // 提前创建好canvas元素
    this.myCanvas = document.createElement("canvas");
    this.myCtx = this.myCanvas.getContext("2d");
    this.imageType = "image/jpeg";
    this.matchTemplateItem = [];
    this.templateObj = null;
  },
  destroyed() {
    URL.revokeObjectURL(this.imageUrl);
  },
  methods: {
    // 限制某种识别类型只能是一个区域
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
      let dataURL = canvas.toDataURL(this.imageType);
      return dataURL;
    },
    //**blob to dataURL**/
    blobToDataURL(fileblob, callback) {
      let filereader = new FileReader();
      filereader.onload = function (e) {
        callback(e.target.result);
      };
      filereader.readAsDataURL(fileblob);
      return filereader;
    },
    /**
     * @name: handleChangeSelect
     * @msg: 用户选择模板
     * @param {temp_id}
     * @return:
     */
    handleChangeSelect(id) {
      this.template_id = id;
      const templateDataArr = JSON.parse(JSON.stringify(this.templateDataArr));
      for (let i = 0; i < templateDataArr.length; i++) {
        let item = templateDataArr[i];
        if (item["temp_id"] == id) {
          this.templateObj = item;
        }
      }
      //清理之前自定框
      this.resetArr();
      const blockItems = this.templateObj["blockItem"];
      this.drawCustomArea(blockItems);
    },
    /**
     * @name: drawReact
     * @msg: 根据模板里自定区域数据，绘制区域
     * @param {blockItems}
     * @return:
     */
    drawCustomArea(blockItems) {
      let oBox = this.$refs.imgEdit;
      for (let j = 0; j < blockItems.length; j++) {
        // 添加新模板上自定区域
        let block = blockItems[j].block;
        let oDiv = this.drawRect(
          block.x,
          block.y,
          block.width,
          block.height,
          blockItems[j].ocr_engine
        );
        oDiv.setAttribute("id", blockItems[j].block_id);
        oBox.appendChild(oDiv);
      }
    },
    // 图片上传前校验
    beforeRead(file) {
      let imgSize = file.size;
      let maxSize = 5 * 1048576;
      this.imageType = file.type;
      if (imgSize > maxSize) {
        this.$notify({
          title: this.$t("upload-size-error"),
          message: this.$t("upload-size-tip"),
        });
        return false;
      }
      let that = this;
      this.result = "";
      this.imageUrl = "";
      // 前面校验通过，显示上传图片加载动效,并将之前上传的数据清空
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

      // 前面校验通过，显示上传图片加载动效,并将之前上传的数据清空
      let oBox = this.$refs.imgEdit;
      oBox.innerHTML = "";
      this.resetArr();
      // 上传图片加载动态
      this.uploadImgLoading = true;
      return true;
    },
    handleUploadSuccess(res, file) {
      //先删除之前添加的框图事件，以免重复添加
      this.removeEditableFunc();
      this.uploadImgLoading = false;
      // 关闭加载进度
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
        this.templateMatching();
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
                    // this.templateMatching();
                  });
                } else {
                  //校准出问题
                }
              } else {
                //提示校准失败
              }
              //用户上传成功匹配模板
              this.templateMatching();
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
     * @name: templateMatching
     * @msg: 模板匹配接口，匹配到直接识别显示结果,从缓存获取templateData,没有则从数据库里读取
     * @param {type}
     * @return:
     */
    async templateMatching() {
      // 优先和本地保存的模板进行匹配
      // 后台读取模板数据
      // let templateDataArr = storeSession.get("templateData") || [];

      api.userTemplateApi
        .selectTemplate()
        .then((res) => {
          this.isRequesting = false;
          let { status, data } = res;
          if (status == 200) {
            if (data.data !== null) {
              let templateDataArr = data.data;
              // console.log(templateDataArr);
              if (templateDataArr.length) {
                templateDataArr.forEach((item, index) => {
                  let blockItem = item.blockItem;
                  blockItem = blockItem.replace(/\\/, "");
                  templateDataArr[index].blockItem = JSON.parse(blockItem);
                });
                this.templateDataArr = templateDataArr;
                //判断当前用户模板数量，如果只有一个，默认匹配第一个，否则，由用户选择模板，模板定义是加个名字，让用户可以根据自己之前定义的名字来选择
                //目前模板匹配接口需要借助python，假设匹配到一个模板 ??? template = [{temp_id,image,blockItem}]
                if (templateDataArr.length == 1) {
                  this.template_id = templateDataArr[0].temp_id;
                  let templateItem = templateDataArr[0]; //这里暂时默认模拟匹配到第一个
                  this.templateObj = templateItem;
                  this.matchTemplateItem = templateItem;
                  let blockItems = this.matchTemplateItem.blockItem;
                  this.drawCustomArea(blockItems);
                  // 调用识别引擎识别显示结果
                  this.requestOcrEngine(blockItems);
                }

                // 弹出模板匹配确认提示模态框
              } else {
                //提醒用户新增模板
                this.$confirm(
                  this.$t("add_template_tip"),
                  this.$t("tip-text"),
                  {
                    confirmButtonText: this.$t("confirm"),
                    cancelButtonText: this.$t("cancel"),
                    type: "warning",
                  }
                )
                  .then(() => {
                    return this.$router.push({
                      name: "customizeOcr",
                    });
                  })
                  .catch(() => {});
              }
            } else {
              //提示获取模板错误
            }
          }
          // this.tableData
        })
        .catch((err) => {
          console.log(err);
          this.isRequesting = false;
        });
    },
    /**
     * @name: requestOcrEngine
     * @msg: 根据用户自定区域调用引擎识别
     * @param {}
     * @return:
     */
    async requestOcrEngine(blockItems) {
      // 模板数据，如果用户在后面有修改了这个模板数据，修改后保存，应该是更新对应模板数据，而不是新增。
      // 所以需要有一个temp_id判断当前是否已经存在
      if (blockItems.length) {
        this.resDetectDataArr = []; //返回数据
        this.userCustomizeArr = []; //请求参数处理
        let templateData = [];
        this.editImageArr = [];
        for (let i = 0; i < blockItems.length; i++) {
          let item = blockItems[i];
          // 根据坐标信息转图片 {x: 279, y: 414, width: 218, height: 55}
          let block = item.block;
          let imageData = await this.getImageByPointsInfo(block);
          // 判断下imageData类型
          if (typeof imageData == "string") {
            let blockItem = {
              block_id: item.block_id,
              name: item.name,
              ocr_engine: item.ocr_engine,
              block: item.block,
              image: imageData, //保存到数据库或者本地，不需要保存这个字段数据
            };
            templateData.push(blockItem);
            this.editImageArr.push(block);
            let obj = {};
            obj.image = imageData.substring(imageData.indexOf(",") + 1);
            let nowTime = Date.now() + "";
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
        }
        this.TemplateData = templateData;
        this.wrapOcrEngine(templateData);
      }
    },
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
     * @name: getImageByPointsInfo
     * @msg: 通过(x,y,width,height)数据获取自定区域图片base64数据
     * @param {}
     * @return:
     */
    async getImageByPointsInfo(points) {
      return new Promise((resolve, reject) => {
        let image = new Image();
        image.src = this.imageUrl;
        image.onload = () => {
          let { x, y, width, height } = points;
          let canvas = document.createElement("canvas"); //创建canvas元素
          canvas.setAttribute("width", width);
          canvas.setAttribute("height", height);
          let ctx = canvas.getContext("2d");
          // 裁剪图片
          ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
          // 将canvas转化base64
          resolve(canvas.toDataURL(this.imageType));
        };
        image.onerror = () => {
          reject(new Error("Could not load image"));
        };
      });
    },
    /**
     * @name: changeCurDivBg
     * @msg: 修改对应自定区域背景色和边框
     * @param {type}
     * @return:
     */
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
     * @name: drawRect
     * @msg: 绘制自定区域
     * @param {type}
     * @return:
     */
    drawRect(x1, y1, width, height, ocr_engine) {
      let oDiv = document.createElement("div");
      oDiv.setAttribute("class", "rect_item");
      oDiv.style.left = x1 + "px";
      oDiv.style.top = y1 + "px";
      oDiv.style.width = width + "px";
      oDiv.style.height = height + "px";
      // oDiv.style.border = "2px solid #409EFF";
      // oDiv.style.background = "rgba(64,158,255,0.4)";
      oDiv.style.position = "absolute";
      this.changeCurDivBg(oDiv, ocr_engine);
      return oDiv;
    },
    resetArr() {
      this.removeEditableFunc();
      this.editImageArr = []; //用于保存用户自定义类型的区域坐标原点和宽高以及类型{type:'expressbill',x:0,y:0,width:100,height:100}--目前只考虑每个类型只能自定义一个区域
      this.userCustomizeArr = []; //用于保存用户自定义区域图片转换处理后相关接口请求参数
      this.resDetectDataArr = []; //自定义区域图片识别后返回的数据
      this.userDataImage = []; //用于保存用户自定义区域图片base64数据,后面用于拼接到resDetectDataArr，用于展示界面数据
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
          //使用canvas绘制识别出的文本行在原图中矩形框
        }
      }
      return googleItems;
    },
    // 确认识别
    confirmDetect() {
      //判断editImageArr当前是否只有一个区域数据，如果只有一个，用户切换识别类型的时候需要更改对应的type
      // 判断是否有模板数据，如果没有，就没必要请求了
      if (this.templateObj && this.templateObj["blockItem"]) {
        this.requestOcrEngine(this.templateObj["blockItem"]);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.ocr-wrap {
  padding: 30px 30px 0 20px;
  min-width: 1600px;
  overflow: hidden;
  .preview_btn {
    margin: 0 10px 0 0;
  }

  .usercustomize_area {
    position: relative;
    overflow-x: auto;
  }
  .img-wrap {
    position: relative;
    margin: 0 30px 10px 0;
    overflow: hidden;
    // cursor: crosshair;
    float: left;
    .rect_item {
      z-index: 99999;
    }
  }
  .btn-list {
    // margin: 0 0 80px 0;
    padding: 0 0 40px 0;
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
    width: 500px;
    // margin: 0 0 0 30px;
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
