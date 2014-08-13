/*!
 * @author hk1k
 */
(function($){
  
  var Uploader = function(element, options){
    options = options || {};
    this.options = options;
    var self = this;
    if(options.dropzone){
      $(options.dropzone).on('drop', function(event){
				event.halt();
				var allTheFiles = event._event.dataTransfer.files;
				self._onFileSelected(allTheFiles, true);
      });
    }
    this.element = element;
    
    if(options.input){
      this.input = $(options.input);
    }

    this.element.find('input[type=file]').on('change', function(e){
      self._onFileSelected(e);
    });
  }
  
  Uploader.prototype._onFileSelected = function(e, dropAction){
    var files;
    if(dropAction){
      files = e;
    }else{
      files = e.currentTarget.files 
    }
    var self = this;
    var file = files[0];
    
    Uploader.upload(file, this.options, function(e, result){
      self.element.find('input[type=file]').val('');
      self.input && self.input.val('');
      if(window.g_uploader && window.g_uploader.callback){
        window.g_uploader.callback(e, result, self.input, self.element, self);
      }
    });
  }
  
  Uploader.upload = function(file, options, callback){
    options = options || {};
    var params = options.params || {};
    var method = options.method || 'POST';
    var timeout = options.timeout || 10000;
    var uploadID = options.uploadID || 'upload';
    var timer;
    var filename = file.fileName != null ? file.fileName : file.name;
    filename = filename.replace(/.*(\/|\\)/, "");
    var fileSize = file.fileSize != null ? file.fileSize : file.size;
    
    var xhr = new XMLHttpRequest();
    
    var _onComplete = function(e){
      if(timer){
        clearTimeout(timer);
        timer = null;
      }
      callback(e, xhr.responseText);
    }
    
    xhr.onreadystatechange = function(){            
      if (xhr.readyState == 4){
        _onComplete();                    
      }
    };

    params[uploadID] = filename;
    
    xhr.open(method, options.action, true);
    xhr.setRequestHeader("Cache-Control", "no-cache");
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.setRequestHeader("X-File-Name", encodeURIComponent(filename));
    xhr.setRequestHeader("X-File-Size", fileSize);
    
    if (window.FormData) {
      //Many thanks to scottt.tw
      var f = new FormData();
      f.append(uploadID, file);
      for(var i in params){
        if(params.hasOwnProperty(i)){
           f.append(i, params[i]);
        }
      }
      xhr.send(f);
    }else if (file.getAsBinary) {
      //Thanks to jm.schelcher
      var boundary = '------multipartformboundary' + (new Date).getTime();
      var dashdash = '--';
      var crlf     = '\r\n';

      /* Build RFC2388 string. */
      var builder = '';

      builder += dashdash;
      builder += boundary;
      builder += crlf;

      builder += 'Content-Disposition: form-data; name="'+ uploadID +'"';

      builder += '; filename="' + encodeURIComponent(filename) + '"';
      builder += crlf;

      builder += 'Content-Type: application/octet-stream';
      builder += crlf;
      builder += crlf;

      /* Append binary data. */
      builder += file.getAsBinary();
      builder += crlf;
 
      for(var i in params){
        if(params.hasOwnProperty(i)){
          builder += dashdash;
          builder += boundary;
          builder += crlf;

          builder += 'Content-Disposition: form-data; name="'+ i +'"';
          builder += crlf;
          builder += crlf;

          builder += encodeURIComponent(params[i]);
          builder += crlf;
        }
      }

      /* Write boundary. */
      builder += dashdash;
      builder += boundary;
      builder += dashdash;
      builder += crlf;
      xhr.setRequestHeader('content-type', 'multipart/form-data; boundary=' + boundary);
      xhr.sendAsBinary(builder);
    }
    
    timer = setTimeout(function(){
      timer = null;
      xhr.abort();
      _onComplete('timeout');
    }, timeout);
  }
  
  $.fn.uploader = function(options){
    options = options || {};
    this.each(function(){
      var $this = $(this);
      var input = $(this).data('input');
      var g_uploader = options.g_uploader || window.g_uploader || {};
      if($(this).data('action')){
        g_uploader.action = $(this).data('action');
      }
      if($(this).data('method')){
        g_uploader.action = $(this).data('method');
      }
      if($(this).data('uploadID')){
        g_uploader.action = $(this).data('uploadID');
      }
      $.extend(options, g_uploader);
      if(input){ options.input = input }
      $this.uploader = new Uploader($this, options);
    });
  }
  
  $(function(){
    $(".fileinput-button").uploader();
  });
  
})(jQuery);