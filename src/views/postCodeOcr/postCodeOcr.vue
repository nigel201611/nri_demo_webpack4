<i18n src="./locals/index.json"></i18n>
<template>
  <div
    v-loading="isRequesting"
    class="postCodeOcr-wrap"
    :element-loading-text="$t('loading-text')"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.6)"
  >
    <div
      v-if="canPreview"
      class="preview_image"
    >
      <img
        :height="bill_height"
        :width="bill_width"
        :src="imageUrl"
      >
      <i
        class="el-icon-circle-close close_preview"
        @click="handlepreview"
      />
    </div>

    <p class="tip">
      <el-button
        class="preview_btn"
        :disabled="!imageUrl"
        type="primary"
        icon="el-icon-zoom-in"
        circle
        @click="handlepreview"
      >
        {{ $t('preview') }}
      </el-button>
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
      <img
        v-if="imageUrl"
        :height="bill_height"
        :width="bill_width"
        :src="imageUrl"
        class="avatar"
      >
      <!-- <p class="avatar_image" v-if="imageUrl"></p> -->
      <i
        v-else
        class="el-icon-plus avatar-uploader-icon"
      />
    </el-upload>
    <div class="upload-result">
      <el-alert
        v-if="confidence!==''"
        :title="$t('confidence-rate')"
        type="success"
        effect="dark"
      >
        {{ confidence }}
      </el-alert>
      <el-form label-width="0">
        <el-form-item label>
          <el-input
            v-if="!fail"
            v-model="result"
            type="textarea"
            autosize
            :readonly="true"
            :placeholder="$t('detect-result')"
          />
          <el-input
            v-else
            type="textarea"
            :value="$t('result-fail')"
            autosize
            :readonly="true"
          />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style lang="scss">
.el-button [class*="fa-"] + span {
  margin-left: 5px;
}
$upload-width: 720px;
$upload-height: 540px;
.avatar-uploader {
  text-align: center;
  margin: 30px auto 40px;
  width: $upload-width;
  height: $upload-height;
}
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: $upload-width;
  height: $upload-height;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: $upload-width;
  height: $upload-height;
  line-height: $upload-height;
  text-align: center;
}
.avatar {
  display: inline-block;
  // position: relative;
  // top: 50%;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
</style>
<style lang="scss" scoped>
.postCodeOcr-wrap {
  width: 720px;
  padding: 30px;
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
// import uuidv4 from "uuid/v4";
// import base64js from "base64-js";
export default {
  components: {},
  data() {
    return {
      isRequesting: false, //控制请求次数和加载状态
      imageUrl: "",
      confidence: "", //識別準確率
      bill_width: "680", //上次運單默認寬度
      bill_height: "400", //上次運單默認高度
      canPreview: false, //是否可以预览图片
      result: "", //图片识别结果
      fail: false //标识是否识别成功
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
      // 计算上传图片大小是否超过5M,目前后台开放10M,为了容错性,提示5M
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
      this.exceedSize = false;
      this.blobToDataURL(file, function(dataurl) {
        let image = new Image();
        image.onload = function() {
          let width = image.width;
          let height = image.height;
          that.bill_width = width;
          that.bill_height = height;
          let iswidthAllow = width > 720;
          // $upload-width: 720px;
          // $upload-height: 400px;
          //图片宽度超过720按比例显示
          if (iswidthAllow) {
            // that.$notify({
            //   title: that.$t("upload-type-error"),
            //   message: that.$t("upload-type-error-tip")
            // });

            let ratio = width / height;
            let fixedWidth = 720;
            let fixedHeight = fixedWidth / ratio;
            that.bill_width = fixedWidth;
            that.bill_height = fixedHeight;

            // 如果图片超过限制，那么需要重新计算imageUrl
            image.width = fixedWidth;
            image.height = fixedHeight;
            that.imageUrl = that.getBase64Image(image);
            that.exceedSize = true;
            // return false;
          }
        };
        image.src = dataurl;
      });

      // 对上传的大小和type做处理
      console.log(type);
      if (
        type !== "image/jpeg" &&
        type !== "image/jpg" &&
        type !== "image/png"
      ) {
        this.$notify({
          title: this.$t("upload-size-error"),
          message: this.$t("upload-size-tip")
        });
        return false;
      }
      this.result = "";
      // this.imageUrl = "";
      return true;
    },

    afterRead(file) {
      if (!this.exceedSize) {
        this.imageUrl = URL.createObjectURL(file.file);
      }
      // this.imageUrl = URL.createObjectURL(file.file);
      if (this.isRequesting) {
        return;
      }
      let requestObj = {
        request_id: Date.now() + "",
        appid: "nri-postcode-ocr", //管理员分配,字符串
        image: ""
      };

      let that = this;
      this.blobToDataURL(file.file, function(dataurl) {
        dataurl = dataurl.substring(dataurl.indexOf(",") + 1);
        requestObj.image = dataurl;
        let detectionName = "postCodeOcrDetection";
        let dectionApiPromise = api.smokeIdentificationApi[detectionName];
        that.isRequesting = true;
        dectionApiPromise(requestObj)
          .then(res => {
            //测试dev server
            // let responesedata = res.data;
            //云服务器
            if (res.status == 200) {
              let responesedata = res.data.data;
              that.isRequesting = false;
              that.fail = false;
              if (responesedata.code == 0) {
                that.result = responesedata.data.text;
                that.confidence = responesedata.data.confidence;
              } else {
                that.result = responesedata.message;
              }
            }
          })
          .catch(error => {
            console.log(error);
            that.fail = true;
            that.isRequesting = false;
            that.result = "result-fail";
          });
      });
    }
  }
};
</script>
