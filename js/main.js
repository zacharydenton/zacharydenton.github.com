// Generated by CoffeeScript 1.8.0
(function() {
  var FractalBanner;

  FractalBanner = (function() {
    function FractalBanner() {
      var _ref;
      this.banner = document.getElementById("banner");
      this.header = document.getElementById("header");
      this.initRenderer();
      this.initShaders();
      this.initQuad();
      this.resize();
      this.animating = (_ref = document.body.classList) != null ? _ref.contains("front") : void 0;
      this.random = Math.random();
      this.timeOffset = 0;
      window.addEventListener("resize", (function(_this) {
        return function(e) {
          return _this.resize(e);
        };
      })(this));
      window.addEventListener("orientationchange", (function(_this) {
        return function(e) {
          return _this.resize(e);
        };
      })(this));
      document.addEventListener("mousemove", (function(_this) {
        return function(e) {
          return _this.mousemove(e);
        };
      })(this));
      header.addEventListener("click", (function(_this) {
        return function(e) {
          return _this.toggleAnimation(e);
        };
      })(this));
    }

    FractalBanner.prototype.initRenderer = function() {
      var _ref;
      this.canvas = document.createElement("canvas");
      this.banner.appendChild(this.canvas);
      return this.gl = (_ref = this.canvas.getContext("webgl")) != null ? _ref : this.canvas.getContext("experimental-webgl");
    };

    FractalBanner.prototype.initShaders = function() {
      var fragmentShader, vertexShader;
      vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
      this.gl.shaderSource(vertexShader, "attribute vec2 position;\nvoid main(){gl_Position=vec4(position,0,1);}");
      this.gl.compileShader(vertexShader);
      fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
      this.gl.shaderSource(fragmentShader, "precision lowp float;\nuniform float time;uniform vec2 resolution;uniform vec2 mouse;vec3 a(vec3 b){vec4 c=vec4(1.0,2.0/3.0,1.0/3.0,3.0);vec3 d=abs(fract(b.xxx+c.xyz)*6.0-c.www);return b.z*mix(c.xxx,clamp(d-c.xxx,0.0,1.0),b.y);}\n#define N 80\nvoid main(void){vec2 e=(gl_FragCoord.xy-resolution/2.0)/min(resolution.y,resolution.x)*20.0;float f=0.0;float g=3.1415926535*2.0;float h=(-.57166-0.001*mouse.x*0.2+0.0001*time)*g;float i=cos(h);float j=sin(h);vec2 k=vec2(i,-j);vec2 l=vec2(j,i);\nvec2 m=vec2(0,1.0+0.618);float n=1.7171+0.001*mouse.y+0.0001*time;for(int o=0;o<N;o++){float p=dot(e,e);if(p>1.0){p=(1.0)/p;e.x=e.x*p;e.y=e.y*p;}f*=.99;f+=p;e=vec2(dot(e,k),dot(e,l))*n+m;}float q=fract(f);q=2.0*min(q,1.0-q);float r=mod(time*0.025,1.0);float tf=q*sin(0.1*time);gl_FragColor=vec4(a(vec3(r-0.25*q-0.1*abs(tf),1.0 - 0.3*abs(tf),q+0.1*abs(tf))),1.0);}");
      this.gl.compileShader(fragmentShader);
      this.shader = this.gl.createProgram();
      this.gl.attachShader(this.shader, vertexShader);
      this.gl.attachShader(this.shader, fragmentShader);
      this.gl.linkProgram(this.shader);
      this.gl.useProgram(this.shader);
      this.positionAttrib = this.gl.getAttribLocation(this.shader, "position");
      this.gl.enableVertexAttribArray(this.positionAttrib);
      this.timeUniform = this.gl.getUniformLocation(this.shader, "time");
      this.gl.uniform1f(this.timeUniform, 0);
      this.resolutionUniform = this.gl.getUniformLocation(this.shader, "resolution");
      this.gl.uniform2f(this.resolutionUniform, this.width, this.height);
      this.mouseUniform = this.gl.getUniformLocation(this.shader, "mouse");
      return this.gl.uniform2f(this.mouseUniform, 0.5, 0.5);
    };

    FractalBanner.prototype.initQuad = function() {
      var vertexPosBuffer, vertices;
      vertexPosBuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexPosBuffer);
      vertices = [-1, -1, 1, -1, -1, 1, 1, 1];
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
      return this.gl.vertexAttribPointer(this.vertexPosAttrib, 2, this.gl.FLOAT, false, 0, 0);
    };

    FractalBanner.prototype.resize = function(e) {
      var _ref;
      this.devicePixelRatio = (_ref = window.devicePixelRatio) != null ? _ref : 1;
      this.width = this.banner.offsetWidth * this.devicePixelRatio;
      this.height = this.banner.offsetHeight * this.devicePixelRatio;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.gl.uniform2f(this.resolutionUniform, this.width, this.height);
      return this.gl.viewport(0, 0, this.width, this.height);
    };

    FractalBanner.prototype.mousemove = function(e) {
      return this.gl.uniform2f(this.mouseUniform, e.clientX / this.width, 1 - e.clientY / this.height);
    };

    FractalBanner.prototype.toggleAnimation = function() {
      this.animating = !this.animating;
      if (this.animating) {
        if (this.lastAnimated == null) {
          this.lastAnimated = 0;
        }
        this.timeOffset += this.lastAnimated - this.timestamp;
        return this.render();
      } else {
        return this.lastAnimated = this.timestamp;
      }
    };

    FractalBanner.prototype.render = function(timestamp) {
      if (timestamp == null) {
        timestamp = 0;
      }
      this.timestamp = timestamp / 1000;
      if (this.animating || this.timestamp === 0) {
        this.gl.uniform1f(this.timeUniform, this.timestamp + this.timeOffset + this.random * 400);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
      }
      return requestAnimationFrame((function(_this) {
        return function(timestamp) {
          return _this.render(timestamp);
        };
      })(this));
    };

    return FractalBanner;

  })();

  document.addEventListener("DOMContentLoaded", function() {
    window.fractalBanner = new FractalBanner();
    return fractalBanner.render();
  });

}).call(this);
