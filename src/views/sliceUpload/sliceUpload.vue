<!--
 * @Author: nigel
 * @Date: 2020-12-22 10:07:43
 * @LastEditTime: 2020-12-23 19:29:53
-->
<template>
  <div class="sliceUpload-wrap">
    <div>
      <input
        type="file"
        :disabled="status !== Status.wait"
        @change="handleFileChange"
      />
      <el-button :disabled="uploadDisabled" @click="handleUpload">上传</el-button>
      <el-button v-if="status === Status.pause" @click="handleResume">恢复</el-button>
      <el-button
        v-else
        :disabled="status !== Status.uploading || !container.hash"
        @click="handlePause"
      >暂停</el-button>
    </div>
    <div>
      <div>计算文件 hash</div>
      <el-progress :percentage="hashPercentage"></el-progress>
      <div>总进度</div>
      <el-progress :percentage="fakeUploadPercentage"></el-progress>
    </div>
    <el-table :data="data" max-height="650">>
      <el-table-column
        prop="hash"
        label="切片hash"
        align="left"
      ></el-table-column>
      <el-table-column label="大小(KB)" align="left">
        <template v-slot="{ row }">
          {{ row.size | transformByte }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style lang="scss" scoped>
.sliceUpload-wrap {
  width: 100%;
  padding: 30px;
  box-sizing: border-box;
}
</style>

<script>
import * as SparkMD5 from "spark-md5"; // 导入脚本
const SIZE = 0.1 * 1024 * 1024; //10MB,100k用于测试
const Status = {
  wait: "wait",
  pause: "pause",
  uploading: "uploading",
};
export default {
  name: "App",
  filters: {
    transformByte(val) {
      return Number((val / 1024).toFixed(0));
    },
  },
  data() {
    return {
      Status,
      container: {
        file: null,
        hash: "",
        worker: null,
      },
      hashPercentage: 0,
      data: [],
      requestList: [],
      status: Status.wait,
      fakeUploadPercentage: 0,
    };
  },
  computed: {
    //上传按钮不可用
    uploadDisabled() {
      return (
        !this.container.file ||
        [Status.pause, Status.uploading].includes(this.status)
      );
    },
    //上传进度百分比
    uploadPercentage() {
      if (!this.container.file || !this.data.length) return 0;
      const loaded = this.data
        .map((item) => item.size * item.percentage)
        .reduce((acc, cur) => acc + cur);
      return parseInt((loaded / this.container.file.size).toFixed(2));
    },
  },
  watch: {
    //下载进度百分比
    uploadPercentage(now) {
      if (now > this.fakeUploadPercentage) {
        this.fakeUploadPercentage = now;
      }
    },
  },
  methods: {
    //中止处理函数
    handlePause() {
      this.status = Status.pause;
      this.resetData();
    },
    resetData() {
      //中止请求列表中的所有请求
      this.requestList.forEach((xhr) => {
        if (xhr) {
          xhr.abort();
        }
      });
      this.requestList = [];
      // if (this.container.worker) {
      //   this.container.worker.onmessage = null;
      // }
    },
    //恢复处理函数
    async handleResume() {
      this.status = Status.uploading;
      //获取已经上传的文件名和hash
      const { uploadedList } = await this.verifyUpload(
        this.container.file.name,
        this.container.hash
      );
      await this.uploadChunks(uploadedList);
    },
    //file input change事件触发
    handleFileChange(e) {
      const [file] = e.target.files;
      if (!file) return;
      this.resetData();
      // 这里干嘛用呢？？？
      Object.assign(this.$data, this.$options.data());
      this.container.file = file;
    },
    async handleUpload() {
      if (!this.container.file) return;
      this.status = Status.uploading;
      //生成文件切片
      const fileChunkList = this.createFileChunk(this.container.file);
      //根据切片列表计算切片hash
      this.container.hash = await this.calculateHash(fileChunkList);
      //检验文件切片是否上传,返回是否需要上传和已上传列表
      const { shouldUpload, uploadedList } = await this.verifyUpload(
        this.container.file.name,
        this.container.hash
      );
      //没有需要上传的文件切片
      if (!shouldUpload) {
        // this.$message.sucess("秒传：上传成功");
        this.$notify({
          type: "success",
          message: "秒传：上传成功",
        });
        this.status = Status.wait;
        return;
      }
      //根据文件列表生成每个切片的信息对象
      this.data = fileChunkList.map(({ file }, index) => ({
        fileHash: this.container.hash,
        index,
        hash: this.container.hash + "-" + index,
        chunk: file,
        size: file.size,
        percentage: uploadedList.includes(index) ? 100 : 0,
      }));
      //上传文件切片
      await this.uploadChunks(uploadedList);
    },
    createFileChunk(file, size = SIZE) {
      const fileChunkList = [];
      let cur = 0;
      while (cur < file.size) {
        fileChunkList.push({ file: file.slice(cur, cur + size) });
        cur += size;
      }
      return fileChunkList;
    },
    calculateHash(fileChunkList) {
      return new Promise((resolve) => {
        const fileHash = (fileChunkList) => {
          const spark = new SparkMD5.ArrayBuffer();
          let percentage = 0;
          let count = 0;
          const loadNext = (index) => {
            const reader = new FileReader(); //异步读取文件，在webworker中使用
            reader.readAsArrayBuffer(fileChunkList[index].file); //读取文件完成后，属性result保存着二进制数据对象
            //文件读取完成后触发
            reader.onload = (e) => {
              //递归计数器
              count++;
              spark.append(e.target.result); //append ArrayBuffer数据
              if (count === fileChunkList.length) {
                this.hashPercentage = 100;
                resolve(spark.end());
              } else {
                percentage += 100 / fileChunkList.length;
                this.hashPercentage = percentage;
                loadNext(count); //递归继续
              }
            };
          };
          loadNext(0);
        };
        fileHash(fileChunkList);
      });
    },
    request({
      url,
      method = "post",
      data,
      headers = {},
      onProgress = (e) => e,
      requestList,
    }) {
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = onProgress;
        xhr.open(method, url);
        Object.keys(headers).forEach((key) =>
          xhr.setRequestHeader(key, headers[key])
        );
        xhr.send(data);
        xhr.onload = (e) => {
          // 将请求成功的 xhr 从列表中删除
          if (requestList) {
            const xhrIndex = requestList.findIndex((item) => item === xhr);
            requestList.splice(xhrIndex, 1);
          }
          resolve({
            data: e.target.response,
          });
        };
        // 暴露当前 xhr 给外部
        requestList?.push(xhr);
      });
    },
    async verifyUpload(filename, fileHash) {
      const { data } = await this.request({
        url: "http://127.0.0.1:80/api/sliceUpload/verify", //验证接口
        headers: {
          "content-type": "application/json",
        },
        data: JSON.stringify({
          filename,
          fileHash,
        }),
      });
      //返回数据
      return JSON.parse(data);
    },
    async mergeRequest() {
      await this.request({
        url: "http://127.0.0.1:80/api/sliceUpload/merge",
        headers: {
          "content-type": "application/json",
        },
        data: JSON.stringify({
          size: SIZE,
          fileHash: this.container.hash,
          filename: this.container.file.name,
        }),
      });
      this.$notify({
        type: "success",
        message: "上传成功",
      });
      this.status = Status.wait;
    },
    async uploadChunks(uploadedList = []) {
      const requestList = this.data
        .filter(({ hash }) => !uploadedList.includes(hash)) //过滤已经上传的chunks
        .map(({ chunk, hash, index }) => {
          const formData = new FormData();
          formData.append("chunk", chunk);
          formData.append("hash", hash);
          formData.append("filename", this.container.file.name);
          formData.append("fileHash", this.container.hash);
          return { formData, index };
        }) //创建表单数据
        .map(async ({ formData }) =>
          this.request({
            url: "http://127.0.0.1:80/api/sliceUpload/upload",
            data: formData,
            // onProgress: this.createProgressHandler(this.data[index]),
            requestList: this.requestList, //将xhr push到请求列表
          })
        ); //创建请求列表
      //并发上传
      await Promise.all(requestList);
      //已经上传切片数量+本次上传切片数量==所有切片数量时
      //切片上传完成，给服务器发送合并切片请求
      if (uploadedList.length + requestList.length === this.data.length) {
        await this.mergeRequest();
      }
    },
  },
};
</script>