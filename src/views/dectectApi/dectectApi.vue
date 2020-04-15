<i18n src="./locals/index.json"></i18n>
<template>
  <div
    class="detect-wrap"
    v-loading="isRequesting"
    :element-loading-text="$t('loading-text')"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.6)"
  >
    <div class="btn-list">
      <el-row type="flex" justify="end">
        <el-button
          icon="el-icon-star-off"
          @click="smokeDetection"
          :type="btnActive=='smoke'?'primary':'default'"
        >{{$t('smoke-detect')}}</el-button>
        <el-button
          icon="fa fa-user-o"
          @click="ageGenderDetection"
          :type="btnActive=='ageGender'?'primary':'default'"
        >{{$t('age-detect')}}</el-button>
        <el-button
          icon="el-icon-setting"
          @click="nozzleDetection"
          :type="btnActive=='nozzle'?'primary':'default'"
        >{{$t('nozzle-detect')}}</el-button>
        <el-button
          icon="fa fa-hand-peace-o"
          @click="gestureDetection"
          :type="btnActive=='gesture'?'primary':'default'"
        >{{$t('gesture-detect')}}</el-button>
      </el-row>
    </div>

    <el-upload
      class="avatar-uploader-detect"
      action="https://imageregdemo.nrihkerp.com"
      :http-request="afterRead"
      name="file"
      :before-upload="beforeRead"
      :on-remove="deletePreview"
      :show-file-list="true"
      :on-success="handleUploadSuccess"
    >
      <img v-if="imageUrl" :src="imageUrl" class="avatar-detect" />
      <i v-else class="el-icon-plus avatar-uploader-icon"></i>
    </el-upload>

    <div class="upload-result">
      <el-form label-width="80px">
        <el-form-item :label="$t('detect-result')">
          <el-input v-if="!fail" v-model="result" :readonly="true"></el-input>
          <el-input v-else :value="$t(result)" :readonly="true"></el-input>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style lang="scss">
.el-button [class*="fa-"] + span {
  margin-left: 5px;
}
$detect-width: 400px;
$detect-height: 400px;

.avatar-uploader-detect .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: $detect-width;
  height: $detect-height;
}
.avatar-uploader-detect .el-upload:hover {
  border-color: #409eff;
}
</style>
<style lang="scss" scoped>
$detect-width: 400px;
$detect-height: 400px;
.detect-wrap {
  width: 800px;
  padding: 30px;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: $detect-width;
  height: $detect-height;
  line-height: $detect-height;
  text-align: center;
}

.avatar-detect {
  width: $detect-width;
  height: $detect-height;
  display: block;
}
.avatar-uploader-detect {
  text-align: center;
  margin: 50px auto 50px;
  width: $detect-width;
  height: $detect-width;
}

.btn-list {
  margin: 20px 10px 0 0;
}
</style>


<script>
import { mapActions, mapState } from "vuex";
import api from "../../api";
export default {
  data() {
    // 选项 数据
    return {
      isRequesting: false, //控制请求次数和加载状态
      btnActive: "smoke",
      imageUrl: "",
      result: "", //图片识别结果
      fail: false //标识是否识别成功
    };
  },
  components: {
    // 定义组件
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
  mounted() {},
  methods: {
    deletePreview() {
      this.result = "";
      this.imageUrl = "";
      URL.revokeObjectURL();
    },
    smokeDetection() {
      this.btnActive = "smoke";
      this.imageUrl = "";
      this.result = "";
    },
    ageGenderDetection() {
      this.btnActive = "ageGender";
      this.imageUrl = "";
      this.result = "";
    },

    nozzleDetection() {
      this.btnActive = "nozzle";
      this.imageUrl = "";
      this.result = "";
    },
    gestureDetection() {
      this.btnActive = "gesture";
      this.imageUrl = "";
      this.result = "";
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
    handleUploadSuccess(res, file) {
      // if (!this.exceedSize) {
      //   this.imageUrl = URL.createObjectURL(file.raw);
      // }
      this.imageUrl = URL.createObjectURL(file.raw);
    },
    // 图片上传前校验
    beforeRead(file) {
      this.result = "";
      let imgSize = file.size;
      let type = file.type;
      let that = this;
      this.blobToDataURL(file, function(dataurl) {
        let image = new Image();
        image.onload = function() {
          let width = image.width;
          let height = image.height;
          that.bill_width = width;
          that.bill_height = height;
          let iswidthAllow = width > 1000;
          // console.log("图片宽度:" + width);
          // if (iswidthAllow) {
          //   //超过尺寸自动压缩
          //   let ratio = width / height;
          //   let fixedWidth = 400;
          //   let fixedHeight = fixedWidth / ratio;
          //   that.bill_width = fixedWidth;
          //   that.bill_height = fixedHeight;

          //   // console.log(width,height,ratio,fixedHeight);

          //   // 如果图片超过限制，那么需要重新计算imageUrl
          //   image.width = fixedWidth;
          //   image.height = fixedHeight;
          //   that.imageUrl = that.getBase64Image(image);
          //   that.exceedSize = true;
          // }
        };
        image.src = dataurl;
      });
      return true;
    },

    afterRead(file) {
      // 此时可以自行将文件上传至服务器
      let params = new FormData(); //创建form对象
      //通过append向form对象添加数据
      params.append("file", file.file);
      this.imageUrl = URL.createObjectURL(file.file);
      if (this.isRequesting) {
        return;
      }

      let detectionName = this.btnActive + "Detection";
      let dectionApiPromise = api.smokeIdentificationApi[detectionName];
      this.isRequesting = true;
      dectionApiPromise(params)
        .then(res => {
          this.isRequesting = false;
          this.fail = false;
          // console.log(res.data.data.code);
          if (res.status == 200) {
            let code = res.data.data.code;
            if (code == 500) {
              this.result = "server error,please connect the developer";
            } else {
              this.result = res.data.data;
            }
          } else {
            this.result = res.statusText;
          }
        })
        .catch(error => {
          this.isRequesting = false;
          this.fail = true;
          this.result = "result-fail";
        });
    }
  }
};
</script>
