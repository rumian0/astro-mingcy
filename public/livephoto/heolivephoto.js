/*! HeoLivePhoto embed (heolivephoto.js) — v2.0 | © 张洪Heo
 *  .pvt 单文件用法（推荐）：
 *    <img src="photo.pvt" alt="Live Photo">
 *    脚本自动取回 .pvt（ZIP 目录包），客户端解出封面 JPEG 与 MP4/MOV 并播放。
 *  兼容：封面与视频分开部署
 *    <img src="cover.jpg" data-live-video="motion.mp4" alt="Live Photo">
 *  兼容 Apple 官方写法（LivePhotosKit 风格，div 即播放框，填满给定尺寸）
 *    <div data-live-photo data-photo-src="cover.jpg" data-video-src="motion.mp4"
 *         style="width:320px;height:320px"></div>
 *  桌面：悬浮左上实况徽标从头播放一遍，移出立即恢复图片；触屏：长按从头播放，松手立即恢复图片。视频静音、默认只播一遍。
 *  左上实况徽标默认展示；data-live-badge="false" 隐藏，或设为自定义徽标文字。
 *  注意：跨域引用 .pvt 时，托管方需允许 CORS。 */
;(function () {
  'use strict'

  // ---------- .pvt（ZIP）客户端解包：JPEG → 封面，MP4/MOV → 动态视频 ----------
  function entryData(u8, dv, lho, method, csize) {
    var start = lho + 30 + dv.getUint16(lho + 26, true) + dv.getUint16(lho + 28, true)
    var data = u8.subarray(start, start + csize)
    if (method === 0) return Promise.resolve(data)
    if (method === 8 && typeof DecompressionStream === 'function') {
      return new Response(
        new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw')),
      )
        .arrayBuffer()
        .then(function (ab) {
          return new Uint8Array(ab)
        })
    }
    return Promise.reject(
      new Error('unsupported zip method ' + method + '（需要现代浏览器的 DecompressionStream）'),
    )
  }
  function extractPvt(u8) {
    var dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength),
      eocd = -1
    for (var i = u8.length - 22; i >= Math.max(0, u8.length - 65558); i--) {
      if (dv.getUint32(i, true) === 0x06054b50) {
        eocd = i
        break
      }
    }
    if (eocd < 0) return Promise.reject(new Error('invalid .pvt (not a zip file)'))
    var count = dv.getUint16(eocd + 10, true),
      p = dv.getUint32(eocd + 16, true),
      te = new TextDecoder()
    var cover = null,
      video = null,
      jobs = []
    for (var n = 0; n < count; n++) {
      var method = dv.getUint16(p + 10, true),
        csize = dv.getUint32(p + 20, true),
        nameLen = dv.getUint16(p + 28, true),
        extraLen = dv.getUint16(p + 30, true),
        commentLen = dv.getUint16(p + 32, true),
        lho = dv.getUint32(p + 42, true),
        name
      try {
        name = te.decode(u8.subarray(p + 46, p + 46 + nameLen))
      } catch (e) {
        name = ''
      }
      p += 46 + nameLen + extraLen + commentLen
      if (/\/$/.test(name)) continue
      var base = name.split('/').pop()
      if (!cover && /\.jpe?g$/i.test(base))
        jobs.push(
          entryData(u8, dv, lho, method, csize).then(function (d) {
            cover = new Blob([d], { type: 'image/jpeg' })
          }),
        )
      else if (!video && /\.(mp4|mov)$/i.test(base))
        jobs.push(
          entryData(u8, dv, lho, method, csize).then(function (d) {
            video = new Blob([d], { type: 'video/mp4' })
          }),
        )
    }
    return Promise.all(jobs).then(function () {
      if (!cover || !video) throw new Error('.pvt 内没有找到 JPEG 封面和 MP4/MOV 视频')
      return { cover: URL.createObjectURL(cover), video: URL.createObjectURL(video) }
    })
  }
  var pvtCache = new Map()
  function loadPvt(url) {
    if (pvtCache.has(url)) return pvtCache.get(url)
    var pr = fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status)
        return r.arrayBuffer()
      })
      .then(function (ab) {
        return extractPvt(new Uint8Array(ab))
      })
    pvtCache.set(url, pr)
    pr.catch(function () {
      pvtCache.delete(url)
    })
    return pr
  }
  function extractMotionFromBuffer(u8) {
    try {
      var head = new TextDecoder().decode(u8.slice(0, Math.min(u8.length, 200000)))
      var m = head.match(/GCamera:MicroVideoOffset="(\d+)"/)
      var offset = m ? parseInt(m[1], 10) : null
      if (!offset) {
        m = head.match(/MicroVideoOffset[^0-9]*(\d{4,})/)
        if (m) offset = parseInt(m[1], 10)
      }
      var videoStart = -1
      if (offset && offset > 0 && offset < u8.length) {
        videoStart = u8.length - offset
        var found = -1
        for (var d = -4; d <= 4; d++) {
          var p = videoStart + d
          if (
            p >= 0 &&
            p + 8 < u8.length &&
            u8[p + 4] == 0x66 &&
            u8[p + 5] == 0x74 &&
            u8[p + 6] == 0x79 &&
            u8[p + 7] == 0x70
          )
            found = p
        }
        if (found == -1) {
          for (var i = Math.max(0, videoStart - 16); i < Math.min(u8.length, videoStart + 16); i++)
            if (u8[i] == 0x66 && u8[i + 1] == 0x74 && u8[i + 2] == 0x79 && u8[i + 3] == 0x70) {
              found = i - 4
              break
            }
        }
        if (found != -1) videoStart = found
        else if (!(u8[videoStart + 4] == 0x66 && u8[videoStart + 5] == 0x74)) return null
      } else {
        for (var i = 0; i < u8.length - 10; i++)
          if (u8[i] == 0xff && u8[i + 1] == 0xd9) {
            for (var j = i + 2; j < Math.min(u8.length, i + 100); j++)
              if (
                j + 8 < u8.length &&
                u8[j + 4] == 0x66 &&
                u8[j + 5] == 0x74 &&
                u8[j + 6] == 0x79 &&
                u8[j + 7] == 0x70
              ) {
                videoStart = j - 4
                break
              }
            if (videoStart != -1) break
          }
        if (videoStart == -1) return null
      }
      var eoi = -1
      for (var i = videoStart - 2; i >= Math.max(0, videoStart - 100000); i--)
        if (u8[i] == 0xff && u8[i + 1] == 0xd9) {
          eoi = i + 2
          break
        }
      if (eoi == -1) eoi = videoStart
      if (videoStart < eoi) videoStart = eoi
      var jpegBytes = u8.slice(0, eoi),
        videoBytes = u8.slice(videoStart)
      if (jpegBytes.length < 1024 || videoBytes.length < 1024) return null
      if (jpegBytes[0] != 0xff || jpegBytes[1] != 0xd8) return null
      if (!(videoBytes[4] == 0x66 && videoBytes[5] == 0x74)) return null
      return {
        cover: new Blob([jpegBytes], { type: 'image/jpeg' }),
        video: new Blob([videoBytes], { type: 'video/mp4' }),
      }
    } catch (e) {
      return null
    }
  }
  var motionCache = new Map()
  function loadMotionPhoto(url) {
    if (motionCache.has(url)) return motionCache.get(url)
    var pr = fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status)
        return r.arrayBuffer()
      })
      .then(function (ab) {
        var res = extractMotionFromBuffer(new Uint8Array(ab))
        if (!res) throw new Error('not a motion photo')
        return { cover: URL.createObjectURL(res.cover), video: URL.createObjectURL(res.video) }
      })
    motionCache.set(url, pr)
    pr.catch(function () {
      motionCache.delete(url)
    })
    return pr
  }

  var LIVE_SVG =
    '<svg viewBox="0 0 52.3828 52.0078" xmlns="http://www.w3.org/2000/svg" width="14" height="14" aria-hidden="true"><g fill="#fff"><path d="M26.0156 2.39062C26.6953 2.39062 27.2109 1.875 27.2109 1.19531C27.2109 0.515625 26.6953 0 26.0156 0C25.3359 0 24.8203 0.515625 24.8203 1.19531C24.8203 1.875 25.3359 2.39062 26.0156 2.39062ZM30.3281 2.78906C31.0078 2.78906 31.5469 2.25 31.5469 1.59375C31.5469 0.914062 31.0078 0.375 30.3281 0.375C29.6719 0.375 29.1328 0.914062 29.1328 1.59375C29.1328 2.25 29.6719 2.78906 30.3281 2.78906ZM34.5 3.89062C35.1797 3.89062 35.6953 3.375 35.6953 2.69531C35.6953 2.01562 35.1797 1.5 34.5 1.5C33.8203 1.5 33.3047 2.01562 33.3047 2.69531C33.3047 3.375 33.8203 3.89062 34.5 3.89062ZM38.4375 5.76562C39.0938 5.76562 39.6328 5.22656 39.6328 4.57031C39.6328 3.89062 39.0938 3.35156 38.4375 3.35156C37.7578 3.35156 37.2188 3.89062 37.2188 4.57031C37.2188 5.22656 37.7578 5.76562 38.4375 5.76562ZM41.9766 8.22656C42.6562 8.22656 43.1719 7.71094 43.1719 7.03125C43.1719 6.35156 42.6562 5.83594 41.9766 5.83594C41.2969 5.83594 40.7812 6.35156 40.7812 7.03125C40.7812 7.71094 41.2969 8.22656 41.9766 8.22656ZM45.0469 11.2969C45.7031 11.2969 46.2422 10.7578 46.2422 10.1016C46.2422 9.42188 45.7031 8.88281 45.0469 8.88281C44.3672 8.88281 43.8281 9.42188 43.8281 10.1016C43.8281 10.7578 44.3672 11.2969 45.0469 11.2969ZM47.5312 14.8594C48.2109 14.8594 48.7266 14.3203 48.7266 13.6641C48.7266 12.9844 48.2109 12.4453 47.5312 12.4453C46.8516 12.4453 46.3359 12.9844 46.3359 13.6641C46.3359 14.3203 46.8516 14.8594 47.5312 14.8594ZM49.3359 18.7734C50.0156 18.7734 50.5547 18.2344 50.5547 17.5547C50.5547 16.8984 50.0156 16.3594 49.3359 16.3594C48.6797 16.3594 48.1406 16.8984 48.1406 17.5547C48.1406 18.2344 48.6797 18.7734 49.3359 18.7734ZM50.4609 22.9219C51.1172 22.9219 51.6562 22.4062 51.6562 21.7266C51.6562 21.0469 51.1172 20.5312 50.4609 20.5312C49.7812 20.5312 49.2422 21.0469 49.2422 21.7266C49.2422 22.4062 49.7812 22.9219 50.4609 22.9219ZM50.8359 27.1875C51.4922 27.1875 52.0312 26.6719 52.0312 25.9922C52.0312 25.3125 51.4922 24.7969 50.8359 24.7969C50.1562 24.7969 49.6172 25.3125 49.6172 25.9922C49.6172 26.6719 50.1562 27.1875 50.8359 27.1875ZM50.4609 31.4531C51.1172 31.4531 51.6562 30.9375 51.6562 30.2578C51.6562 29.5781 51.1172 29.0625 50.4609 29.0625C49.7812 29.0625 49.2422 29.5781 49.2422 30.2578C49.2422 30.9375 49.7812 31.4531 50.4609 31.4531ZM49.3359 35.625C50.0156 35.625 50.5547 35.0859 50.5547 34.4062C50.5547 33.75 50.0156 33.2109 49.3359 33.2109C48.6797 33.2109 48.1406 33.75 48.1406 34.4062C48.1406 35.0859 48.6797 35.625 49.3359 35.625ZM47.5312 39.5156C48.2109 39.5156 48.7266 39 48.7266 38.3203C48.7266 37.6406 48.2109 37.125 47.5312 37.125C46.8516 37.125 46.3359 37.6406 46.3359 38.3203C46.3359 39 46.8516 39.5156 47.5312 39.5156ZM45.0469 43.0781C45.7031 43.0781 46.2422 42.5625 46.2422 41.8828C46.2422 41.2031 45.7031 40.6875 45.0469 40.6875C44.3672 40.6875 43.8281 41.2031 43.8281 41.8828C43.8281 42.5625 44.3672 43.0781 45.0469 43.0781ZM41.9766 46.1484C42.6562 46.1484 43.1719 45.6094 43.1719 44.9531C43.1719 44.2734 42.6562 43.7344 41.9766 43.7344C41.2969 43.7344 40.7812 44.2734 40.7812 44.9531C40.7812 45.6094 41.2969 46.1484 41.9766 46.1484ZM38.4375 48.6094C39.0938 48.6094 39.6328 48.0938 39.6328 47.4141C39.6328 46.7344 39.0938 46.2188 38.4375 46.2188C37.7578 46.2188 37.2188 46.7344 37.2188 47.4141C37.2188 48.0938 37.7578 48.6094 38.4375 48.6094ZM34.5 50.4844C35.1797 50.4844 35.6953 49.9453 35.6953 49.2891C35.6953 48.6094 35.1797 48.0703 34.5 48.0703C33.8203 48.0703 33.3047 48.6094 33.3047 49.2891C33.3047 49.9453 33.8203 50.4844 34.5 50.4844ZM30.3281 51.5859C31.0078 51.5859 31.5469 51.0703 31.5469 50.3906C31.5469 49.7109 31.0078 49.1953 30.3281 49.1953C29.6719 49.1953 29.1328 49.7109 29.1328 50.3906C29.1328 51.0703 29.6719 51.5859 30.3281 51.5859ZM26.0156 51.9844C26.6953 51.9844 27.2109 51.4453 27.2109 50.7891C27.2109 50.1094 26.6953 49.5703 26.0156 49.5703C25.3359 49.5703 24.8203 50.1094 24.8203 50.7891C24.8203 51.4453 25.3359 51.9844 26.0156 51.9844ZM21.7031 51.5859C22.3594 51.5859 22.8984 51.0703 22.8984 50.3906C22.8984 49.7109 22.3594 49.1953 21.7031 49.1953C21.0234 49.1953 20.4844 49.7109 20.4844 50.3906C20.4844 51.0703 21.0234 51.5859 21.7031 51.5859ZM17.5312 50.4844C18.2109 50.4844 18.7266 49.9453 18.7266 49.2891C18.7266 48.6094 18.2109 48.0703 17.5312 48.0703C16.8516 48.0703 16.3359 48.6094 16.3359 49.2891C16.3359 49.9453 16.8516 50.4844 17.5312 50.4844ZM13.5938 48.6094C14.2734 48.6094 14.8125 48.0938 14.8125 47.4141C14.8125 46.7344 14.2734 46.2188 13.5938 46.2188C12.9375 46.2188 12.3984 46.7344 12.3984 47.4141C12.3984 48.0938 12.9375 48.6094 13.5938 48.6094ZM10.0547 46.1484C10.7344 46.1484 11.25 45.6094 11.25 44.9531C11.25 44.2734 10.7344 43.7344 10.0547 43.7344C9.375 43.7344 8.85938 44.2734 8.85938 44.9531C8.85938 45.6094 9.375 46.1484 10.0547 46.1484ZM6.98438 43.0781C7.66406 43.0781 8.20312 42.5625 8.20312 41.8828C8.20312 41.2031 7.66406 40.6875 6.98438 40.6875C6.32812 40.6875 5.78906 41.2031 5.78906 41.8828C5.78906 42.5625 6.32812 43.0781 6.98438 43.0781ZM4.5 39.5156C5.17969 39.5156 5.69531 39 5.69531 38.3203C5.69531 37.6406 5.17969 37.125 4.5 37.125C3.82031 37.125 3.30469 37.6406 3.30469 38.3203C3.30469 39 3.82031 39.5156 4.5 39.5156ZM2.69531 35.625C3.35156 35.625 3.89062 35.0859 3.89062 34.4062C3.89062 33.75 3.35156 33.2109 2.69531 33.2109C2.01562 33.2109 1.47656 33.75 1.47656 34.4062C1.47656 35.0859 2.01562 35.625 2.69531 35.625ZM1.57031 31.4531C2.25 31.4531 2.78906 30.9375 2.78906 30.2578C2.78906 29.5781 2.25 29.0625 1.57031 29.0625C0.914062 29.0625 0.375 29.5781 0.375 30.2578C0.375 30.9375 0.914062 31.4531 1.57031 31.4531ZM1.19531 27.1875C1.875 27.1875 2.41406 26.6719 2.41406 25.9922C2.41406 25.3125 1.875 24.7969 1.19531 24.7969C0.539062 24.7969 0 25.3125 0 25.9922C0 26.6719 0.539062 27.1875 1.19531 27.1875ZM1.57031 22.9219C2.25 22.9219 2.78906 22.4062 2.78906 21.7266C2.78906 21.0469 2.25 20.5312 1.57031 20.5312C0.914062 20.5312 0.375 21.0469 0.375 21.7266C0.375 22.4062 0.914062 22.9219 1.57031 22.9219ZM2.69531 18.7734C3.35156 18.7734 3.89062 18.2344 3.89062 17.5547C3.89062 16.8984 3.35156 16.3594 2.69531 16.3594C2.01562 16.3594 1.47656 16.8984 1.47656 17.5547C1.47656 18.2344 2.01562 18.7734 2.69531 18.7734ZM4.5 14.8594C5.17969 14.8594 5.69531 14.3203 5.69531 13.6641C5.69531 12.9844 5.17969 12.4453 4.5 12.4453C3.82031 12.4453 3.30469 12.9844 3.30469 13.6641C3.30469 14.3203 3.82031 14.8594 4.5 14.8594ZM6.98438 11.2969C7.66406 11.2969 8.20312 10.7578 8.20312 10.1016C8.20312 9.42188 7.66406 8.88281 6.98438 8.88281C6.32812 8.88281 5.78906 9.42188 5.78906 10.1016C5.78906 10.7578 6.32812 11.2969 6.98438 11.2969ZM10.0547 8.22656C10.7344 8.22656 11.25 7.71094 11.25 7.03125C11.25 6.35156 10.7344 5.83594 10.0547 5.83594C9.375 5.83594 8.85938 6.35156 8.85938 7.03125C8.85938 7.71094 9.375 8.22656 10.0547 8.22656ZM13.5938 5.76562C14.2734 5.76562 14.8125 5.22656 14.8125 4.57031C14.8125 3.89062 14.2734 3.35156 13.5938 3.35156C12.9375 3.35156 12.3984 3.89062 12.3984 4.57031C12.3984 5.22656 12.9375 5.76562 13.5938 5.76562ZM17.5312 3.89062C18.2109 3.89062 18.7266 3.375 18.7266 2.69531C18.7266 2.01562 18.2109 1.5 17.5312 1.5C16.8516 1.5 16.3359 2.01562 16.3359 2.69531C16.3359 3.375 16.8516 3.89062 17.5312 3.89062ZM21.7031 2.78906C22.3594 2.78906 22.8984 2.25 22.8984 1.59375C22.8984 0.914062 22.3594 0.375 21.7031 0.375C21.0234 0.375 20.4844 0.914062 20.4844 1.59375C20.4844 2.25 21.0234 2.78906 21.7031 2.78906Z"/><path d="M26.0156 44.9062C36.4688 44.9062 44.9531 36.4688 44.9531 25.9922C44.9531 15.5859 36.4219 7.05469 26.0156 7.05469C15.5156 7.05469 7.07812 15.5156 7.07812 25.9922C7.07812 36.5156 15.4922 44.9062 26.0156 44.9062ZM26.0156 42.6328C16.7344 42.6328 9.375 35.2734 9.375 25.9922C9.375 16.7812 16.8047 9.35156 26.0156 9.35156C35.2031 9.35156 42.6562 16.8047 42.6562 25.9922C42.6562 35.2031 35.2266 42.6328 26.0156 42.6328Z"/><path d="M26.0156 35.6719C31.3594 35.6719 35.6484 31.3594 35.6484 26.0391C35.6484 20.7188 31.3359 16.4062 26.0156 16.4062C20.6719 16.4062 16.3828 20.6953 16.3828 26.0391C16.3828 31.3828 20.6484 35.6719 26.0156 35.6719ZM26.0156 31.2422C23.1328 31.2422 20.8125 28.9219 20.8125 26.0391C20.8125 23.1562 23.1328 20.8359 26.0156 20.8359C28.875 20.8359 31.2188 23.1797 31.2188 26.0391C31.2188 28.9219 28.8984 31.2422 26.0156 31.2422Z"/></g></svg>'

  function absolutize(u) {
    try {
      return new URL(u, document.baseURI).href
    } catch (e) {
      return u
    }
  }
  function play(vp) {
    if (!(vp && vp.paused)) return
    var p = vp.play()
    if (p && p.catch)
      p.catch(function (err) {
        if (err && err.name === 'AbortError')
          setTimeout(function () {
            if (vp.paused) vp.play().catch(function () {})
          }, 400)
      })
  }
  function pause(vp) {
    if (vp && !vp.paused) vp.pause()
  }
  function badgeTextFor(attr) {
    if (attr === null || attr === '' || String(attr).toLowerCase() === 'true') {
      var docLang =
        ((document.documentElement && document.documentElement.lang) || '') +
        '|' +
        ((typeof navigator !== 'undefined' && navigator.language) || '') +
        '|' +
        ((typeof navigator !== 'undefined' &&
          navigator.languages &&
          navigator.languages.join(',')) ||
          '')
      return /zh/i.test(docLang) ? '实况' : 'LIVE'
    }
    if (String(attr).toLowerCase() !== 'false') return attr
    return null
  }
  function addBadge(wrap, attr) {
    var t = badgeTextFor(attr)
    if (!t) return null
    var badge = document.createElement('span')
    badge.className = 'live-badge'
    badge.setAttribute('aria-hidden', 'true')
    badge.style.cssText =
      'position:absolute;top:8px;left:8px;z-index:2;display:flex;align-items:center;gap:5px;padding:6px 12px 6px 9px;border-radius:980px;background:rgba(0,0,0,.38);-webkit-backdrop-filter:blur(12px) saturate(180%);backdrop-filter:blur(12px) saturate(180%);color:#fff;font:600 14px/1 -apple-system,BlinkMacSystemFont,"SF Pro Text","PingFang SC","Microsoft YaHei",sans-serif;pointer-events:auto;cursor:pointer;white-space:nowrap;'
    badge.innerHTML =
      LIVE_SVG +
      '<span>' +
      String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') +
      '</span>'
    wrap.appendChild(badge)
    return badge
  }
  function bindPlayback(wrap, vp, badge) {
    var imgEl = wrap.querySelector('img')
    var playing = false
    var scaleTimer = null
    var stopTimer = null
    function scheduleScaleBack() {
      clearTimeout(scaleTimer)
      scaleTimer = null
      var d = vp.duration
      if (!isFinite(d) || d <= 0.5) return
      var cur = isFinite(vp.currentTime) ? vp.currentTime : 0
      var remain = d - cur - 0.3
      if (remain < 0) remain = 0
      scaleTimer = setTimeout(function () {
        vp.style.transform = 'scale(1)'
        if (imgEl) imgEl.style.opacity = '1'
      }, remain * 1000)
    }
    function show() {
      clearTimeout(stopTimer)
      stopTimer = null
      vp.style.transform = 'scale(1.1)'
      if (imgEl) imgEl.style.opacity = '0'
      play(vp)
      scheduleScaleBack()
    }
    function start() {
      clearTimeout(stopTimer)
      stopTimer = null
      if (playing) {
        try {
          vp.currentTime = 0
        } catch (e) {}
        vp.style.transform = 'scale(1.1)'
        if (imgEl) imgEl.style.opacity = '0'
        if (vp.paused) play(vp)
        scheduleScaleBack()
        return
      }
      playing = true
      var needSeek = false
      try {
        needSeek = vp.ended || vp.currentTime > 0.05
      } catch (e) {
        needSeek = true
      }
      if (vp.readyState >= 1 && needSeek) {
        vp.addEventListener('seeked', function onSeek() {
          vp.removeEventListener('seeked', onSeek)
          if (playing) show()
        })
        try {
          vp.currentTime = 0
        } catch (e) {
          show()
          return
        }
        setTimeout(function () {
          if (playing && vp.paused && imgEl && imgEl.style.opacity !== '0') show()
        }, 350)
      } else show()
    }
    function stop() {
      if (!playing) return
      clearTimeout(scaleTimer)
      scaleTimer = null
      clearTimeout(stopTimer)
      if (vp.ended) {
        playing = false
        vp.style.transform = 'scale(1)'
        if (imgEl) imgEl.style.opacity = '1'
        pause(vp)
        try {
          if (vp.readyState >= 1 && !vp.ended) vp.currentTime = 0
        } catch (e) {}
        return
      }
      vp.style.transform = 'scale(1)'
      if (imgEl) imgEl.style.opacity = '1'
      stopTimer = setTimeout(function () {
        playing = false
        pause(vp)
        try {
          if (vp.readyState >= 1 && !vp.ended) vp.currentTime = 0
        } catch (e) {}
      }, 300)
    }
    vp.addEventListener('ended', stop)
    vp.addEventListener('loadedmetadata', function () {
      if (playing) scheduleScaleBack()
    })
    var lastTouch = 0,
      timer = null
    wrap.addEventListener(
      'touchstart',
      function () {
        lastTouch = Date.now()
        timer = setTimeout(start, 260)
      },
      { passive: true },
    )
    ;['touchend', 'touchcancel'].forEach(function (t) {
      wrap.addEventListener(t, function () {
        lastTouch = Date.now()
        clearTimeout(timer)
        stop()
      })
    })
    wrap.addEventListener('contextmenu', function (e) {
      e.preventDefault()
    })
    var hover = badge || wrap
    hover.addEventListener('mouseenter', function () {
      if (Date.now() - lastTouch > 500) start()
    })
    hover.addEventListener('mouseleave', function () {
      if (Date.now() - lastTouch > 500) stop()
    })
    if (hover !== wrap)
      wrap.addEventListener('mouseleave', function () {
        stop()
      })
    wrap.addEventListener('focusin', start)
    wrap.addEventListener('focusout', stop)
    vp.addEventListener('loadeddata', function prime() {
      vp.removeEventListener('loadeddata', prime)
      try {
        if (vp.currentTime > 0) vp.currentTime = 0
      } catch (e) {}
    })
    var ctrl = {
      start: start,
      stop: stop,
      reset: function () {
        playing = false
        clearTimeout(scaleTimer)
        clearTimeout(stopTimer)
        scaleTimer = null
        stopTimer = null
        vp.style.transform = 'scale(1)'
        if (imgEl) imgEl.style.opacity = '1'
        try {
          pause(vp)
        } catch (e) {}
      },
    }
    wrap._heoLiveCtrl = ctrl
    return ctrl
  }
  function resetPlayback(wrap) {
    if (wrap && wrap._heoLiveCtrl) wrap._heoLiveCtrl.reset()
  }
  function enhance(img) {
    if (img.dataset.liveReady) return null
    var pvtSrc =
      img.getAttribute('data-live-pvt') ||
      (/\.pvt$/i.test(img.getAttribute('src') || '') ? img.getAttribute('src') : null)
    var videoSrc = pvtSrc ? null : img.getAttribute('data-live-video')
    var imgSrc = img.getAttribute('src') || ''
    var isMotionCandidate =
      !pvtSrc && !videoSrc && imgSrc && (/\.jpe?g$/i.test(imgSrc) || imgSrc.indexOf('blob:') === 0)
    if (!pvtSrc && !videoSrc && !isMotionCandidate) return null
    if (isMotionCandidate) {
      var origCss = img.style.cssText
      img.dataset.liveReady = '1'
      var loop = (img.getAttribute('data-live-loop') || 'false').toLowerCase() === 'true'
      var vp = document.createElement('video')
      vp.muted = true
      vp.setAttribute('muted', '')
      if (loop) vp.setAttribute('loop', '')
      else vp.removeAttribute('loop')
      vp.playsInline = true
      vp.setAttribute('playsinline', '')
      vp.preload = 'auto'
      vp.setAttribute('aria-hidden', 'true')
      vp.className = img.className
      vp.style.cssText =
        'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;margin:0;border:0;border-radius:inherit;opacity:1;transform:scale(1);pointer-events:none;transition:transform .3s ease;will-change:transform;z-index:0;'
      var wrap = document.createElement('span')
      wrap.style.cssText =
        'display:inline-block;position:relative;max-width:100%;line-height:0;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;overflow:hidden;border-radius:inherit;'
      img.style.cssText +=
        ';position:relative;display:block;width:100%;height:auto;max-width:100%;object-fit:contain;margin:0;border:0;border-radius:inherit;z-index:1;opacity:1;transition:opacity .3s ease;will-change:opacity;-webkit-user-drag:none;'
      if (getComputedStyle(img).position === 'static') wrap.style.position = 'relative'
      img.parentNode.insertBefore(wrap, img)
      wrap.appendChild(vp)
      wrap.appendChild(img)
      var badge = addBadge(wrap, img.getAttribute('data-live-badge'))
      bindPlayback(wrap, vp, badge)
      return loadMotionPhoto(absolutize(imgSrc))
        .then(function (m) {
          vp.src = m.video
        })
        .catch(function () {
          try {
            if (badge && badge.parentNode) badge.remove()
            wrap.parentNode.insertBefore(img, wrap)
            img.style.cssText = origCss
            wrap.remove()
            img.removeAttribute('data-live-ready')
            if (wrap._heoLiveCtrl) delete wrap._heoLiveCtrl
          } catch (e) {}
          return null
        })
    }
    img.dataset.liveReady = '1'
    var loop = (img.getAttribute('data-live-loop') || 'false').toLowerCase() === 'true'
    var vp = document.createElement('video')
    vp.muted = true
    vp.setAttribute('muted', '')
    if (loop) vp.setAttribute('loop', '')
    else vp.removeAttribute('loop')
    vp.playsInline = true
    vp.setAttribute('playsinline', '')
    vp.preload = 'auto'
    vp.setAttribute('aria-hidden', 'true')
    vp.className = img.className
    vp.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;margin:0;border:0;border-radius:inherit;opacity:1;transform:scale(1);pointer-events:none;transition:transform .3s ease;will-change:transform;z-index:0;'
    var wrap = document.createElement('span')
    wrap.style.cssText =
      'display:inline-block;position:relative;max-width:100%;line-height:0;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;overflow:hidden;border-radius:inherit;'
    img.style.cssText +=
      ';position:relative;display:block;width:100%;height:auto;max-width:100%;object-fit:contain;margin:0;border:0;border-radius:inherit;z-index:1;opacity:1;transition:opacity .3s ease;will-change:opacity;-webkit-user-drag:none;'
    if (getComputedStyle(img).position === 'static') wrap.style.position = 'relative'
    img.parentNode.insertBefore(wrap, img)
    wrap.appendChild(vp)
    wrap.appendChild(img)
    bindPlayback(wrap, vp, addBadge(wrap, img.getAttribute('data-live-badge')))
    if (pvtSrc) {
      return loadPvt(absolutize(pvtSrc))
        .then(function (m) {
          img.src = m.cover
          vp.src = m.video
        })
        .catch(function (err) {
          img.setAttribute('data-live-error', '1')
          console.warn('[livephoto] .pvt 加载失败：', err)
          throw err
        })
    }
    vp.src = absolutize(videoSrc)
    return null
  }
  function enhanceDiv(div) {
    if (div.dataset.liveReady) return null
    var photoSrc = div.getAttribute('data-photo-src')
    var videoSrc = div.getAttribute('data-video-src')
    var pvtSrc = div.getAttribute('data-live-pvt')
    var isMotionCandidate =
      !pvtSrc &&
      !videoSrc &&
      photoSrc &&
      (/\.jpe?g$/i.test(photoSrc) || photoSrc.indexOf('blob:') === 0)
    if (!photoSrc && !videoSrc && !pvtSrc) return null
    div.dataset.liveReady = '1'
    var loop = (div.getAttribute('data-live-loop') || 'false').toLowerCase() === 'true'
    if (getComputedStyle(div).position === 'static') div.style.position = 'relative'
    div.style.overflow = 'hidden'
    div.replaceChildren()
    var vp = document.createElement('video')
    vp.muted = true
    vp.setAttribute('muted', '')
    if (loop) vp.setAttribute('loop', '')
    else vp.removeAttribute('loop')
    vp.playsInline = true
    vp.setAttribute('playsinline', '')
    vp.preload = 'auto'
    vp.setAttribute('aria-hidden', 'true')
    vp.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;margin:0;border:0;opacity:1;transform:scale(1);pointer-events:none;transition:transform .3s ease;will-change:transform;z-index:0;'
    if (videoSrc || pvtSrc || isMotionCandidate) div.appendChild(vp)
    var img = null
    if (photoSrc || pvtSrc) {
      img = document.createElement('img')
      img.alt = div.getAttribute('data-alt') || 'Live Photo'
      img.style.cssText =
        'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;margin:0;border:0;z-index:1;opacity:1;transition:opacity .3s ease;will-change:opacity;-webkit-user-drag:none;'
      if (photoSrc) img.src = absolutize(photoSrc)
      div.appendChild(img)
    }
    var divBadge = addBadge(div, div.getAttribute('data-live-badge'))
    if (!videoSrc && !pvtSrc && !isMotionCandidate) return null
    bindPlayback(div, vp, divBadge)
    if (pvtSrc) {
      return loadPvt(absolutize(pvtSrc))
        .then(function (m) {
          if (img) img.src = m.cover
          vp.src = m.video
        })
        .catch(function (err) {
          div.setAttribute('data-live-error', '1')
          console.warn('[livephoto] .pvt 加载失败：', err)
          throw err
        })
    }
    if (videoSrc) {
      vp.src = absolutize(videoSrc)
      return null
    }
    if (isMotionCandidate) {
      return loadMotionPhoto(absolutize(photoSrc))
        .then(function (m) {
          vp.src = m.video
        })
        .catch(function () {
          return null
        })
    }
    return null
  }
  function scan(root) {
    var jobs = []
    ;(root || document)
      .querySelectorAll(
        'img[data-live-pvt], img[data-live-video], img[src$=".pvt" i], img[data-live-motion]',
      )
      .forEach(function (img) {
        var r = enhance(img)
        if (r) jobs.push(r)
      })
    ;(root || document)
      .querySelectorAll(
        'img[src$=".jpg" i], img[src$=".jpeg" i], img[data-live-motion], img[src^="blob:"]',
      )
      .forEach(function (img) {
        if (img.dataset.liveReady) return
        if (img.hasAttribute('data-live-pvt') || img.hasAttribute('data-live-video')) return
        var r = enhance(img)
        if (r) jobs.push(r)
      })
    ;(root || document).querySelectorAll('div[data-live-photo]').forEach(function (div) {
      var r = enhanceDiv(div)
      if (r) jobs.push(r)
    })
    return Promise.allSettled(jobs)
  }
  // 【补丁】移除自动 scan：改由外部 IntersectionObserver 按需调用 scan(item)，
  //         避免首屏一次性拉取全部 .pvt / 对所有 .jpg 做 Motion Photo 探测导致卡顿。
  //         升级 Heo 时请重新打此补丁：删掉 IIFE 末尾的自动 scan 调用即可。
  window.HeoLivePhoto = { scan: scan, bindPlayback: bindPlayback, reset: resetPlayback }
})()
