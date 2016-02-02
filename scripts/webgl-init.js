 var gl;
    function initGL(canvas) {
        try {
            gl = canvas.getContext("experimental-webgl");
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
        } catch (e) {
        }
        if (!gl) {
            alert("Could not initialise WebGL, sorry :-(");
        }
    }


    function getShader(gl, id) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }

        var str = "";
        var k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }

        var shader;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }


    var shaderProgram;

    function initShaders() {
        var fragmentShader = getShader(gl, "per-vertex-fs");
        var vertexShader = getShader(gl, "per-vertex-vs");

        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }

        gl.useProgram(shaderProgram);

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

        shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
        gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

        //shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
       // gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
        //shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
        shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
        shaderProgram.lightingDirectionUniform = gl.getUniformLocation(shaderProgram, "uLightingDirection");
        shaderProgram.directionalColorUniform = gl.getUniformLocation(shaderProgram, "uDirectionalColor"); 
    }

  
   
    function handleLoadedTexture(texture) {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        gl.bindTexture(gl.TEXTURE_2D, null);
      }


    var mudTexture;

    function initTexture() {
        mudTexture = gl.createTexture();
        mudTexture.image = new Image();
        mudTexture.image.onload = function () {
            handleLoadedTexture(mudTexture)
        }

        mudTexture.image.src = "mud.jpg";
      }


    var mvMatrix = mat4.create();
    var mvMatrixStack = [];
    var pMatrix = mat4.create();

    function mvPushMatrix() {
    var copy = mat4.create();
    mat4.set(mvMatrix, copy);
    mvMatrixStack.push(copy);
  }

  function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
      throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
  }


    function setMatrixUniforms() {
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);

        var normalMatrix = mat3.create();
        mat4.toInverseMat3(mvMatrix, normalMatrix);
        mat3.transpose(normalMatrix);
        gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
    }


    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }

  var mouseDown = false;
    var lastMouseX = null;
    var lastMouseY = null;

    var rotationMatrix = mat4.create();
    mat4.identity(rotationMatrix);

    function handleMouseDown(event) 
    {
        mouseDown = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    }


    function handleMouseUp(event) {
        mouseDown = false;
    }


    function handleMouseMove(event) {
        if (!mouseDown) {
            return;
        }
        var newX = event.clientX;
        var newY = event.clientY;

        var deltaX = newX - lastMouseX
        var newRotationMatrix = mat4.create();
        mat4.identity(newRotationMatrix);
        mat4.rotate(newRotationMatrix, degToRad(deltaX / 10), [0, 1, 0]);

        var deltaY = newY - lastMouseY;
        mat4.rotate(newRotationMatrix, degToRad(deltaY / 10), [1, 0, 0]);

        mat4.multiply(newRotationMatrix, rotationMatrix, rotationMatrix);

        lastMouseX = newX
        lastMouseY = newY;
    }


    var x = 0;
    var y = 0;
    var z = -5.0;
    var currentlyPressedKeys = {};

    function handleKeyDown(event) 
    {
        currentlyPressedKeys[event.keyCode] = true;        
    }


    function handleKeyUp(event) 
    {
        currentlyPressedKeys[event.keyCode] = false;
    }

    function handleKeys() 
    {
        if (currentlyPressedKeys[38]) {
            //Up arrow
            z -= 0.05;
        }
        if (currentlyPressedKeys[40]) {
            // Down arrow
            z += 0.05;
        }

        if (currentlyPressedKeys[37]) {
            // Left cursor key
            y -= 0.05;
        }
        if (currentlyPressedKeys[39]) {
            // Right cursor key
            y += 0.05;
        }
        /*
        if (currentlyPressedKeys[38]) {
            // Up cursor key
            x -= 1;
        }
        if (currentlyPressedKeys[40]) {
            // Down cursor key
            x += 1;
        }
        */
    }


  var model;

  function handleLoadedModel(modelData)
  {
    var result = new Object();
    result.vertices = new Array();
    result.indices = new Array();
    result.normals = new Array();
    modelData = modelData.replace(/ +(?= )/g,'').replace(/\t/g, ' ');
    var lines = modelData.split("\n");
    var temp;
    var i = 0;
    var tempVertices = new Array();
    var tempIndices = new Array();
    var ch = {minX : 0, maxX: 0, minY: 0, maxY: 0};
    if (lines[0].replace(/[\n\r]+/g, '').trim() == "OFF")
    {
      temp = lines[1].split(" ");
      result.numVertices = parseInt(temp[0]);
      result.numFaces = parseInt(temp[1]);
      result.numEdges = parseInt(temp[2]);
      i = 2;
    } else if (lines[0].replace(/[\n\r]+/g, '').trim() == "ply")
    {
      for(i; lines[i].indexOf("end_header") == -1; i++)
      {
        temp = lines[i].split(" ");
        if (temp[1] == "vertex") {result.numVertices = parseInt(temp[2]); }
        if (temp[1] == "face") {result.numFaces = parseInt(temp[2]);  }
      }
      i++;
    } else
    {
      alert("Formato non supportato");
    }
    var startline = i;
    for (i; i < (result.numVertices+startline); i++)
    {
      temp = lines[i].trim().split(" ");
      tempVertices.push({
        x : parseFloat(temp[0]),
        y : parseFloat(temp[1]),
        z : parseFloat(temp[2])
        });
      ch.minX = Math.min(ch.minX, parseFloat(temp[0]));
      ch.maxX = Math.max(ch.maxX, parseFloat(temp[0]));
      ch.minY = Math.min(ch.minY, parseFloat(temp[1]));
      ch.maxY = Math.max(ch.maxY, parseFloat(temp[1]));
    }
    for (i; i < lines.length; i++)
    {
      temp = lines[i].trim().split(" ");
          
      var nVertices = parseInt(temp[0]);
      if (nVertices)
      {
        tempIndices.push(parseInt(temp[1]));
        tempIndices.push(parseInt(temp[2]));
        tempIndices.push(parseInt(temp[3]));

        for (var c = 3; c < nVertices; c++) //decompose a polygon in triangles
        {
          tempIndices.push(parseInt(temp[c]));
          tempIndices.push(parseInt(temp[c+1]));
          tempIndices.push(parseInt(temp[1]));
        }
      }

    }
    
    for (i = 0; i < tempIndices.length; i++) //create new vertices from the faces
    {
      result.vertices.push(tempVertices[tempIndices[i]].x);
      result.vertices.push(tempVertices[tempIndices[i]].y);
      result.vertices.push(tempVertices[tempIndices[i]].z);
      //result.indices.push()
    }
    for (i = 0; i < result.vertices.length; i+=9) //calculate normals
    {
      var a = new vec3.create();
      var b = new vec3.create();
      var c = new vec3.create();
      a[0] = result.vertices[i];
      a[1] = result.vertices[i+1];
      a[2] = result.vertices[i+2];
      b[0] = result.vertices[i+3];
      b[1] = result.vertices[i+4];
      b[2] = result.vertices[i+5];
      c[0] = result.vertices[i+6];
      c[1] = result.vertices[i+7];
      c[2] = result.vertices[i+8];
      var dir = vec3.create();
      var out = vec3.create();
      var norm = vec3.create();
      dir = vec3.cross(vec3.subtract(b, a), vec3.subtract(c,a));
      norm = vec3.normalize(dir);
      result.normals.push(norm[0]);result.normals.push(norm[1]);result.normals.push(norm[2]);
      result.normals.push(norm[0]);result.normals.push(norm[1]);result.normals.push(norm[2]);
      result.normals.push(norm[0]);result.normals.push(norm[1]);result.normals.push(norm[2]);
    }
    console.log(result);
    model = result;
    console.log(ch);
    x = (ch.minX + ch.maxX)/-2;
    y = (ch.minY + ch.maxY)/-2;
    z = (Math.abs(ch.minX) + Math.abs(ch.maxX))*-2.5;
    mat4.identity(rotationMatrix);
  }

  
  var vertexPositionBuffer;
  var vertexNormalBuffer;
  var vertexTextureCoordBuffer;
  var vertexIndexBuffer;

  function initBuffers()
  {
    vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
    vertexPositionBuffer.itemSize = 3;
    vertexPositionBuffer.numItems = model.vertices.length / 3;

/*
    vertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);
    vertexIndexBuffer.itemSize = 1;
    vertexIndexBuffer.numItems = model.indices.length;
    */

    vertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.normals), gl.STATIC_DRAW);
    vertexNormalBuffer.itemSize = 3;
    vertexNormalBuffer.numItems = model.normals / 3;
  }