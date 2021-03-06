var camera, cameraAngle, scene, renderer;
var controls;

//var objects = [];
//var targets = { page: [], sphere: [], helix: [], grid: [] };
//var chosen = [];
//var initialPositions = [];
var allPages = [];
var currentPage;

var REblock = new RegExp("^block");
var REpage = new RegExp("^page");
var container;

var pivot = new THREE.Vector3();
pivot.x=0;
pivot.y=0;
pivot.z=-3000;

var printText = ":::::";
var message;

function page( element )
{
	this.name = element.id;
	this.pageElement = element;
	this.DOMobjects = [];
	this.targets = { page: [], sphere: [], helix: [], grid: [] };
	this.WGLobjects = [];
	this.initialPositions = [];
	this.initPage = function()
	{
		getAllChildren(this.pageElement, REblock, this.DOMobjects);
		getPageTargets(this.DOMobjects, this.targets.page, this.initialPositions);
		getSphereTargets(this.DOMobjects, this.targets.sphere, 900);
		getHelixTargets(this.DOMobjects, this.targets.helix, 1100);
		getGridTargets(this.DOMobjects, this.targets.grid);
	}
}

function position(x, y, z)
{
	this.x = x;
	this.y = y;
	this.z = z;
}

function getAllChildren(element , regex, chosenElements) 
{	
	if (element.id == undefined)
		return null;
	if (element.hasChildNodes())
	{
		var array = element.childNodes;
		for (x in array)
		{
			if (array[x].id == undefined)
				continue;
			if (regex.test(array[x].id))
			{
				chosenElements.push (array[x]);
			}
			else if (array[x].hasChildNodes())
			{
				getAllChildren(array[x] , regex, chosenElements);
			}
		}
	}
}

function lookAwayFrom(obj, piv)
{
	var temp = new THREE.Vector3();
	obj.position.x -= piv.x;
	obj.position.y -= piv.y;
	obj.position.z -= piv.z;
	temp.copy( obj.position ).multiplyScalar( 2 );
	obj.lookAt( temp );
	obj.position.x += piv.x;
	obj.position.y += piv.y;
	obj.position.z += piv.z;
}

function getPageTargets(source, destination, initPos)
{
	var rect, object, boxleft, boxtop, boxwidth, boxheight, theta, pos;
	var vect = new THREE.Vector3();
	vect.copy( pivot );
	for ( var i = 0; i < source.length; i ++ ) 
	{
		rect = source[i].getBoundingClientRect();
		object = new THREE.Object3D();
		boxleft = rect.left;
		boxtop = rect.top;
		boxwidth = rect.right-rect.left;
		boxheight = rect.bottom-rect.top;
		object.position.x = boxleft - (window.innerWidth/2) + boxwidth/2;
		object.position.y = (window.innerHeight/2) - boxtop - boxheight/2;
		pos = new position(object.position.x, object.position.y, 0);
		initPos.push( pos );
		vect.x = object.position.x;
		theta = object.position.y / vect.z;
		object.position.y = vect.z * Math.sin(theta);
		object.position.z = vect.z - vect.z * Math.cos(theta);
		lookAwayFrom(object, vect);
		destination.push( object );
	}
}

function getNextScroll(source, sourcePositions, destination, alpha)
{
	var vect = new THREE.Vector3();
	vect.copy( pivot );
	var object, rect, theta;
	for ( var i = 0; i < source.length; i ++ )
	{
		object = new THREE.Object3D();
		vect.x = source[i].position.x;
		theta = (sourcePositions[i].y / vect.z) + alpha;
		object.position.x = source[i].position.x;
		object.position.y = vect.z * Math.sin(theta);
		object.position.z = vect.z - vect.z * Math.cos(theta);
		lookAwayFrom(object, vect);
		destination.push( object );
	}
}

function getSphereTargets(source, destination, radius)
{
	var vector = new THREE.Vector3();
	var phi, theta, object;
	for ( var i = 0, l = source.length; i < l; i ++ ) 
	{
		phi = Math.acos( -1 + ( 2 * i ) / l );
		theta = Math.sqrt( l * Math.PI ) * phi;
		object = new THREE.Object3D();
		object.position.x = radius * Math.cos( theta ) * Math.sin( phi );
		object.position.y = radius * Math.sin( theta ) * Math.sin( phi );
		object.position.z = radius * Math.cos( phi );
		vector.copy( object.position ).multiplyScalar( 2 );
		object.lookAt( vector );
		destination.push( object );
	}
}

function getHelixTargets(source, destination, radius)
{
	var vector = new THREE.Vector3();
	var phi, object;
	for ( var i = 0, l = source.length; i < l; i ++ ) 
	{
		var phi = i * 0.175 + Math.PI;
		var object = new THREE.Object3D();
		object.position.x = radius * Math.sin( phi );
		object.position.y = - ( i * 8 ) + 450;
		object.position.z = radius * Math.cos( phi );
		vector.copy( object.position );
		vector.x *= 2;
		vector.z *= 2;
		object.lookAt( vector );
		destination.push( object );
	}
}

function getGridTargets(source, destination)
{
	var object;
	for ( var i = 0; i < source.length; i ++ ) {
		object = new THREE.Object3D();
		object.position.x = ( ( i % 5 ) * 400 ) - 800;
		object.position.y = ( - ( Math.floor( i / 5 ) % 5 ) * 400 ) + 800;
		object.position.z = ( Math.floor( i / 25 ) ) * 1000 - 2000;
		destination.push( object );
	}
}

function getRandomTarget(object)
{
	object.position.x = (Math.random() * 4000 + 2000) * Math.pow(-1, Math.floor(Math.random() * 100));
	object.position.y = (Math.random() * 4000 + 2000) * Math.pow(-1, Math.floor(Math.random() * 100));
	object.position.z = (Math.random() * 2000 + 2000) * Math.pow(-1, Math.floor(Math.random() * 100));
	//object.position.x = Math.random() * 4000 - 2000;
	//object.position.y = Math.random() * 4000 - 2000;
	//object.position.z = Math.random() * 4000 - 2000;
	object.rotation.x = Math.random() % Math.PI*2;
	object.rotation.y = Math.random() % Math.PI*2;
	object.rotation.z = Math.random() % Math.PI*2;
}

function explodePage( element )
{
	var object;
	var randomTargets = [];
	for ( var i = 0; i < element.WGLobjects.length; i++ )
	{
		object = new THREE.Object3D();
		getRandomTarget(object);
		randomTargets.push(object);
	}
	transform(element.WGLobjects, randomTargets, 3000, 3000 );
}

var curIndex = 0;

function getNextPage()
{
	curIndex++;
	if ( curIndex >= allPages.length ) curIndex = 0;
	explodePage( currentPage );
	currentPage = allPages[curIndex];
	transform(currentPage.WGLobjects, currentPage.targets.page, 3000, 3000 );
}

function init() 
{
	cameraAngle = 75;
	camera = new THREE.PerspectiveCamera( cameraAngle, window.innerWidth / window.innerHeight, 1, 5000 );
	camera.position.z = window.innerHeight/(2*Math.tan((Math.PI/180)*(cameraAngle/2)));
	scene = new THREE.Scene();

	var object;
	for ( var i = 0; i < allPages.length; i ++ ) 
	{
		for ( var j = 0; j < allPages[i].DOMobjects.length; j ++ )
		{
			object = new THREE.CSS3DObject( allPages[i].DOMobjects[j] );
			getRandomTarget(object);
			scene.add( object );
			allPages[i].WGLobjects.push( object );
		}
	}

	renderer = new THREE.CSS3DRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight);
	renderer.domElement.style.position = 'absolute';
	container.innerHTML="";
	container.appendChild( renderer.domElement );
	

	/*
	controls = new THREE.TrackballControls( camera, renderer.domElement );
	controls.rotateSpeed = 0.5;
	controls.addEventListener( 'change', render );
	*/
	
	var transformTime = 1500;
	
	var button = document.getElementById( 'page' );
	button.addEventListener( 'click', function ( event ) {transform(currentPage.WGLobjects, currentPage.targets.page, transformTime, transformTime );}, false );

	var button = document.getElementById( 'sphere' );
	button.addEventListener( 'click', function ( event ) {transform(currentPage.WGLobjects, currentPage.targets.sphere, transformTime, transformTime );}, false );

	var button = document.getElementById( 'helix' );
	button.addEventListener( 'click', function ( event ) {transform(currentPage.WGLobjects, currentPage.targets.helix, transformTime, transformTime );}, false );

	var button = document.getElementById( 'grid' );
	button.addEventListener( 'click', function ( event ) {transform(currentPage.WGLobjects, currentPage.targets.grid, transformTime, transformTime );}, false );

	var button = document.getElementById( 'next' );
	button.addEventListener( 'click', function ( event ) {getNextPage();}, false );

	transform(currentPage.WGLobjects, currentPage.targets.page, 3000, 3000 );
	
	window.addEventListener( 'resize', onWindowResize, false );
}

function transform(sources, destinations, duration, variation) 
{
	//TWEEN.removeAll();
	//createjs.Tween.removeAllTweens();
	for ( var i = 0; i < sources.length; i ++ ) 
	{
		var object = sources[ i ];
		var target = destinations[ i ];
		//createjs.Tween.removeTweens(object.position);
		//createjs.Tween.removeTweens(object.rotation);
		createjs.Tween.get( object.position ).to( { x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * variation + duration, createjs.Ease.elasticOut ).addEventListener("change", tempfunc);;
		createjs.Tween.get( object.rotation ).to( { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * variation + duration, createjs.Ease.quartInOut ).addEventListener("change", tempfunc);;
	
	}
	var x=10;
	createjs.Tween.get( x ).to( 1000, duration * 2 ).addEventListener("change", tweenChanged);
		//.onChange( render )
}

function tempfunc(){
//console.log("VsdsdF")
}

function onWindowResize() 
{
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() 
{
	requestAnimationFrame( animate );
	createjs.Tween.tick();
	//createjs.Tween.update();
	//controls.update();
}

function tweenChanged( event )
{
//	console.log("tween");
	render();
}

function render() 
{
	//console.log("rendered");
	renderer.render( scene, camera );
}

function start() 
{
	var children = [];
	var tempPage;
	container = document.getElementById("container");
	getAllChildren(container, REpage, children);
	for ( var i = 0 ; i < children.length ; i++ )
	{
		tempPage = new page(children[i]);
		tempPage.initPage();
		allPages.push(tempPage);
	}
	currentPage = allPages[0];
	init();
	animate();
}








