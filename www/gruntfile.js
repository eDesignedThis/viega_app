module.exports = function (grunt) {
require('load-grunt-tasks')(grunt);
 grunt.initConfig({  
        pkg: grunt.file.readJSON('package.json'),
		useminPrepare: {
	      html: 'indexweb.html',
	      options: {
	        dest: 'dist'
	      }
	  },
	  copy:{
	     files: 
            {
                expand: true,
                src: [
                    'img/*.*',
					'fonts/*.*',
					'css/images/*.*',
					'css/custom.css',
					'js/custom.js',
					'js/jquery-2.1.1.min.js',
                    '*.html'
                ],
                dest: 'dist'
            },
	    index: {
	    	src: './indexweb.html', dest: 'dist/index.html'
	    }
	  },
	   filerev: {
    options: {
      algorithm: 'md5',
      length: 8
    },
    images: {
      src: 'dist/**/all*.{css,js}'
    }
  },
  clean: {
    release: [
        'dist'
    ]
},
	  usemin:{
	  	html:['dist/index.html']
	  }
});

grunt.registerTask('build', [
  'clean',
  'useminPrepare',
  'concat:generated',
  'cssmin:generated',
  'uglify:generated',
  'copy:files',
  'copy:index',
  'filerev',
  'usemin'
]);

}