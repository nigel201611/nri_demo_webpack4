<i18n src="./locals/index.json"></i18n>
<template>
  <div
    v-loading="isRequesting"
    class="postCodeOcr-wrap"
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
      <!-- <img v-if="imageUrl" :height="bill_height" :width="bill_width" :src="imageUrl" class="avatar" /> -->
      <div v-if="imageUrl" class="avatar" :style="imgObj"></div>
      <i v-else class="el-icon-plus avatar-uploader-icon" />
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
        <el-table-column prop="itemstring" :label="$t('recog_result')" />
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
      // 计算上传图片大小是否超过5M,目前后台开放10M,为了容错性,提示5M
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

      this.result = "";
      return true;
    },

    afterRead(file) {
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
        options: { scene: "postcode" },
      };

      let that = this;
      this.blobToDataURL(file.file, function (dataurl) {
        dataurl = dataurl.substring(dataurl.indexOf(",") + 1);
        requestObj.image = dataurl;
        let detectionName = "postCodeOcrDetection";
        let dectionApiPromise = api.smokeIdentificationApi[detectionName];
        that.isRequesting = true;
        dectionApiPromise(requestObj)
          .then((res) => {
            that.isRequesting = false;
            that.fail = false;
            let { status, data } = res;
            if (status == 200) {
              if (data.errno == 0) {
                // if (data.data && data.data.errorcode == 0) {
                //   that.tableData = data.data && data.data.items;
                // } else {
                //   that.tableData = [{ itemstring: data.data.errormsg }];
                // }
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
                      // {
                      //   rowName: "address",
                      //   itemstring:
                      //     ocrResponse.address && ocrResponse.address["text"],
                      //   itemconf:
                      //     ocrResponse.address && ocrResponse.address["score"],
                      // },
                      // {
                      //   rowName: "name",
                      //   itemstring:
                      //     ocrResponse.name && ocrResponse.name["text"],
                      //   itemconf: ocrResponse.name && ocrResponse.name["score"],
                      // },
                      {
                        rowName: "postcode",
                        itemstring:
                          ocrResponse.postcode && ocrResponse.postcode["text"],
                        itemconf:
                          ocrResponse.postcode && ocrResponse.postcode["score"],
                      },
                    ];
                  }
                } else {
                  that.tableData = [
                    {
                      rowName: "error code",
                      itemstring: "something error ",
                      itemconf: 0,
                    },
                  ];
                }
              }
            }
          })
          .catch((error) => {
            console.log(error);
            that.fail = true;
            that.isRequesting = false;
            that.result = "result-fail";
          });
      });
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
  width: $upload-width;
  height: $upload-height;
  font-size: 36px;
  color: #8c939d;
  cursor: pointer;
  border: 1px dashed #d9d9d9;
  display: flex;
  justify-content: center;
  align-items: center;
  float: left;
}
.result-details {
  float: left;
  margin: 0 0 0 20px;
}
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: $upload-width;
  height: $upload-height;
  display: flex;
  justify-content: center;
  align-items: center;
}
.avatar {
  display: inline-block;
  width: $upload-width;
  height: $upload-height;
  box-sizing: border-box;
  background-position: center center;
  background-size: contain;
  background-repeat: no-repeat;
}
.avatar-uploader:hover {
  border-color: #409eff;
}
.postCodeOcr-wrap {
  // width: 100%;
  // min-width: 800px;
  overflow: hidden;
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