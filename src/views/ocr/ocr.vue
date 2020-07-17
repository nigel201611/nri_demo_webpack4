<i18n src="./locals/index.json"></i18n>
<template>
  <div
    v-loading="isRequesting"
    class="ocr-wrap"
    :element-loading-text="$t('loading-text')"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.6)"
  >
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
      <img v-if="imageUrl" :height="bill_height" :width="bill_width" :src="imageUrl" class="avatar" />
      <i v-else class="el-icon-plus avatar-uploader-icon" />
    </el-upload>
    <div class="result-details">
      <el-table
        v-loading="isRequesting"
        align="left"
        :data="tableData"
        height="436"
        style="width: 400px"
        :empty-text="$t('no_data')"
      >
        <el-table-column type="index" />
        <el-table-column prop="itemstring" :label="$t('recog_result')" />
      </el-table>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.el-button [class*="fa-"] + span {
  margin-left: 5px;
}
$upload-width: 400px;
$upload-height: 410px;
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
}

.avatar {
  display: inline-block;
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
  .preview_btn {
    margin: 0 10px 0 0;
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
}
</style>

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
      bill_width: "400", //上次運單默認寬度
      bill_height: "410", //上次運單默認高度
      canPreview: false, //是否可以预览图片
      result: "", //图片识别结果
      fail: false, //标识是否识别成功
      tableData: [] //识别的数据
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
    this.exceedSize = false; //用于标识上传图片是否超过限制D
  },
  created() {
    //运单识别生成的唯一标识，用于请求参数
    // this.request_id = uuidv4();
  },
  methods: {
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
          message: this.$t("upload-size-error-tip")
        });
        return false;
      }
      let type = file.type;
      let that = this;
      this.blobToDataURL(file, function(dataurl) {
        let image = new Image();
        image.onload = function() {
          let width = image.width;
          let height = image.height;
          that.bill_width = width;
          that.bill_height = height;
          let iswidthAllow = width >= 400;
          // console.log("图片宽度:" + width);
          if (iswidthAllow) {
            // that.$notify({
            //   title: that.$t("upload-type-error"),
            //   message: this.$t("upload-type-error-tip")
            // });
            // return false;
            //超过尺寸自动压缩
            let ratio = width / height;
            let fixedWidth = 400;
            let fixedHeight = fixedWidth / ratio;
            that.bill_width = fixedWidth;
            that.bill_height = fixedHeight;

            // 如果图片超过限制，那么需要重新计算imageUrl
            image.width = fixedWidth;
            image.height = fixedHeight;
            that.imageUrl = that.getBase64Image(image);
            that.exceedSize = true;
          }
        };
        image.src = dataurl;
      });

      // 对上传的大小和type做处理
      // console.log(type);
      if (
        type !== "image/jpeg" &&
        type !== "image/jpg" &&
        type !== "image/png"
      ) {
        this.$notify({
          title: this.$t("upload-type-error"),
          message: this.$t("upload-type-tip")
        });
        return false;
      }
      this.result = "";
      // this.imageUrl = "";
      return true;
    },

    afterRead(file) {
      let params = new FormData(); //创建form对象
      params.append("file", file.file);
      // this.imageUrl = URL.createObjectURL(file.file);
      if (!this.exceedSize) {
        this.imageUrl = URL.createObjectURL(file.file);
      }
      if (this.isRequesting) {
        return;
      }
      let nowTime = Date.now() + "";
      let requestObj = {
        session_id: nowTime,
        app_id: nowTime, //管理员分配,字符串
        image: ""
      };

      let that = this;
      this.blobToDataURL(file.file, function(dataurl) {
        dataurl = dataurl.substring(dataurl.indexOf(",") + 1);
        requestObj.image = dataurl;
        let detectionName = "expressBillDetection";
        let dectionApiPromise = api.smokeIdentificationApi[detectionName];
        that.isRequesting = true;
        dectionApiPromise(requestObj)
          .then(res => {
            //云服务器
            that.isRequesting = false;
            that.fail = false;
            let { status, data } = res;
            if (status == 200) {
              if (data.errno == 0) {
                // that.result = data.items && data.items.map;
                that.tableData = data.data && data.data.items;
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
    }
  }
};
</script>
