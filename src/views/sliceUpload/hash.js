self.importScripts("./spark-md5.min.js"); // 导入脚本

// 生成文件 hash
self.onmessage = (e) => {
  const { fileChunkList } = e.data;
  const spark = new self.SparkMD5.ArrayBuffer();
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
        self.postMessage({
          percentage: 100,
          hash: spark.end(), //完成hash
        });
        self.close(); //关闭 Worker 线程。
      } else {
        percentage += 100 / fileChunkList.length;
        self.postMessage({
          percentage,
        });
        loadNext(count); //递归继续
      }
    };
  };
  loadNext(0);
};
