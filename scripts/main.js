
var ambColor = {r:0.8, g:0.8, b: 0.8};
var dirColor = {r:0.2, g:0.2, b: 0.2}; 

function drawScene() 
{
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.01, 10000.0, pMatrix);

    mat4.identity(mvMatrix);

    mat4.translate(mvMatrix, [x, y, z]);

    mat4.multiply(mvMatrix, rotationMatrix);

    //mat4.rotate(mvMatrix, degToRad(-pitch), [1, 0, 0]);
    //mat4.rotate(mvMatrix, degToRad(-yaw), [0, 1, 0]);
    //mat4.translate(mvMatrix, [-xPos, -yPos, -zPos]);

    //gl.activeTexture(gl.TEXTURE0);
    //gl.bindTexture(gl.TEXTURE_2D, mudTexture);
    //gl.uniform1i(shaderProgram.samplerUniform, 0);

    //gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexTextureCoordBuffer);
    //gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, worldVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

 gl.uniform3f(
                shaderProgram.ambientColorUniform,
                ambColor.r,
                ambColor.g,
                ambColor.b
            );

            var lightingDirection = [
                parseFloat(document.getElementById("dirX").value),
                parseFloat(document.getElementById("dirY").value),
                parseFloat(document.getElementById("dirZ").value)
            ];
            var adjustedLD = vec3.create();
            vec3.normalize(lightingDirection, adjustedLD);
            vec3.scale(adjustedLD, -1);
            gl.uniform3fv(shaderProgram.lightingDirectionUniform, adjustedLD);

            gl.uniform3f(
                shaderProgram.directionalColorUniform,
                dirColor.r,
                dirColor.g,
                dirColor.b
            );




    

    //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
    setMatrixUniforms();
    //gl.drawElements(gl.TRIANGLES, vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numItems);
}

function tick() 
{
  requestAnimFrame(tick);
  handleKeys();
  drawScene();
} 


function webGLStart() 
{
  var canvas = document.getElementById("canvas");
  initGL(canvas);
  initShaders();
  initBuffers();
  //initTexture();
  //loadWorld();

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthRange(-100, 100);

  canvas.onmousedown = handleMouseDown;
  document.onmouseup = handleMouseUp;
  document.onmousemove = handleMouseMove;

   document.onkeydown = handleKeyDown;
   document.onkeyup = handleKeyUp;

  tick();
}




function init()
{
  handleLoadedModel(cubeModel);
  document.getElementById('files').addEventListener('change', handleFileSelect, false);
  webGLStart();
  
  document.getElementById('ambColor').addEventListener('change', function(e){ambColor = rgb2vec(e.target.value);}, false);
  document.getElementById('dirColor').addEventListener('change', function(e){dirColor = rgb2vec(e.target.value);}, false);
}