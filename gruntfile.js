module.exports = function (grunt) {
require('load-grunt-tasks')(grunt);
 grunt.initConfig({  
        pkg: grunt.file.readJSON('package.json'),
		useminPrepare: {
	      html: 'www/indexweb.html',
	      options: {
		    flow: {
				steps: {
					js: ['concat','uglifyjs'],
					jsmin: ['concat'],
					css: ['concat', 'cssmin']
				},
				post: []
			},
	        dest: 'dist/'
	      }
	  },
	  copy:{
	     files: 
            {
                expand: true,
                src: [
                    'www/img/*.*',
					'www/fonts/*.*',
					'www/css/images/**',
					'www/css/custom.css',
					'www/js/custom.js',
					'www/js/jquery-2.1.1.min.js',
                    'www/*.html'
                ],
                dest: 'dist'
            },
	    index: {
	    	src: './www/indexweb.html', dest: 'dist/www/index.html'
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
	  	html:['dist/www/index.html']
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