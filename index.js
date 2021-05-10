var walkSync = require('walk-sync')
var path = require('path')
var fs = require('fs')
var qiniu = require('qiniu')

var configPath = path.resolve(__dirname, './qiniu-config.js')

// 判断配置文件是否存在
let hasConfig = fs.existsSync(configPath)

if (!hasConfig) {
  console.log(configPath + ' 配置文件不存在')
  return
}

var qiniuConfig = require(configPath)

// 远端路径
var remotePath = qiniuConfig.remotePath
// 上传路径
var localPath = path.resolve(__dirname, qiniuConfig.localPath)

var mac = new qiniu.auth.digest.Mac(qiniuConfig.accessKey, qiniuConfig.secretKey)
var putPolicy = new qiniu.rs.PutPolicy(qiniuConfig.options)
var uploadToken = putPolicy.uploadToken(mac)
var config = new qiniu.conf.Config()
config.zone = qiniu.zone.Zone_z2
var formUploader = new qiniu.form_up.FormUploader(config)



async function main () {
  // 读取上传目录
  var upPaths = walkSync(localPath, {
    globs: ['!**/*.html'],
    directories: false
  })
  for (let pth of upPaths) {
    await upLoadFile(pth)
  }
}

function getSize (pth) {
  var fileInfo = fs.statSync(pth)
  var size = fileInfo.size
  if (size) {
    if (size < 1000) {
      return `${size}B`
    } else if (size < 1000 * 1000) {
      return `${Math.floor(size / 1000)}KB`
    } else {
      return `${Math.floor(size / 1000 / 1000)}MB`
    }
  }
  return ''
}

function upLoadFile (pth) {
  // 每次上传一个文件都需要实例化一次配置，不然上传后识别content-type会出错
  var putExtra = new qiniu.form_up.PutExtra()

  return new Promise((resolve, reject) => {
    let key = remotePath + pth
    let localFile = path.resolve(localPath, pth)
    var viewPath = qiniuConfig.localPath + '/' + pth
    formUploader.putFile(uploadToken, key, localFile, putExtra, function (
      err,
      body,
      info
    ) {
      if (info.statusCode === 200) {
        console.log(`${qiniuConfig.domain + remotePath + pth}  ===> 成功 size: ${getSize(localFile)}`)
        resolve()
      } else if (info.statusCode === 614) {
        console.log(`${viewPath}  ===> 失败：资源已存在`)
        resolve()
      } else if (info.statusCode === 631) {
        console.log('指定空间不存在')
        reject(err)
      } else {
        console.log('------------------------')
        console.log(`${viewPath}  ===> 出错`)
        console.log(err)
        console.log('------------------------')
        reject(err)
      }
    })
  })
}

main()