# qiniu-upload
七牛上传工具

# 安装

Using npm:
```shell
$ npm i qiniu-upload
```

# 使用

在根目录创建 qiniu-config.js

下面为测试参数，请勿线上使用
```
module.exports = {
  accessKey: 'icWlsqwotf8WW0w8HZjEQ-pt82OwGV-ovr4grTGX',
  secretKey: 'kIMgIufG5FRmoEEhlXUFbc5hMLOvKx2BZ2HIixcD',
  remotePath: 'mytest/',
  localPath: './test',
  domain: '//img.hhooke.cn/',
  options: {
    scope: 'ht-server',
    expires: 7200,
    detectMime: 1,
    returnBody:
      '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}'
  }
}
```

