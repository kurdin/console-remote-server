const gulp = require('gulp');
const util = require('gulp-util');
const cssmin = require('@adamwood/gulp-cssmin');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const pump = require('pump');
const del = require('del');
const print = require('gulp-print');
const rev = require('gulp-rev');
const revReplace = require('gulp-rev-replace');
const concat = require('gulp-concat');
const changed = require('gulp-changed');
const livereload = require('gulp-livereload');
const connect = require('gulp-connect');
const htmlreplace = require('gulp-html-replace');
const replaceTemplate = require('gulp-replace-template');
const transform = require('gulp-transform');
const htmlminifier = require('./lib/html-minifier');
const rewriteModule = require('http-rewrite-middleware');
const open = require('opn');

require('custom-env').env(process.env.NODE_ENV || 'development');

const manifest = 'rev-manifest.json';
const paths = {
	www: 'www/',
	app: 'app/',
	build: 'build/',
};

const version = require('./package.json').version;

const production = process.env.NODE_ENV === 'production' ? true : !!util.env.production;
// eslint-disable-next-line no-console
console.log('Run tasks for:', production ? 'production' : 'development');

const clearWwwBuild = async (cb) => {
	await del([paths.build + 'www'], { force: true });
	cb();
};

const clearAppBuild = async (cb) => {
	await del([paths.build + 'app'], { force: true });
	cb();
};

const reload = () => gulp.src([paths.www + 'src/**/*', paths.app + 'src/**/*']).pipe(livereload({ start: true }));

const buildJsVendors = (cb) =>
	pump(
		[
			// vendors bundle
			gulp.src([
				paths.www + 'src/js/libs/1-codemirror5.js',
				paths.www + 'src/js/libs/2-runmode5.js',
				paths.www + 'src/js/libs/3-javascript5.js',
			]),
			print(),
			production ? uglify() : util.noop(),
			concat('vendors.js'),
			rename({ suffix: '-bundle' }),
			rev(),
			gulp.dest(paths.build + 'www/js'),
			rev.manifest(manifest, {
				merge: true,
			}),
			gulp.dest('.'),
		],
		cb
	);

const buildJs = (cb) =>
	pump(
		[
			gulp.src([paths.www + 'src/js/index.js', paths.www + 'src/js/tryapp.js']),
			print(),
			replaceTemplate(
				{
					consoleVersion: version,
				},
				{ prefix: '{{', suffix: '}}' }
			),
			production ? uglify() : util.noop(),
			rename({ suffix: '-bundle' }),
			rev(),
			gulp.dest(paths.build + 'www/js'),
			rev.manifest(manifest, {
				merge: true,
			}),
			gulp.dest('.'),
		],
		cb
	);

const buildCss = (cb) =>
	pump(
		[
			gulp.src([paths.www + 'src/css/styles.css', paths.www + 'src/css/codemirror5.css']),
			print(),
			production ? cssmin({ rebase: false }) : util.noop(),
			rename({ basename: 'bundle' }),
			concat('www-bundle.css'),
			rev(),
			gulp.dest(paths.build + 'www/css'),
			rev.manifest(manifest, {
				merge: true,
			}),
			gulp.dest('.'),
		],
		cb
	);

const updateHtml = () => {
	const manifestFile = gulp.src('./' + manifest);

	return gulp
		.src(paths.www + 'src/*.html')
		.pipe(print())
		.pipe(revReplace({ manifest: manifestFile }))
		.pipe(production ? util.noop() : htmlreplace({ liveReload: '//localhost:35729/livereload.js?snipver=1' }))
		.pipe(
			replaceTemplate(
				{
					consoleVersion: version,
					consoleHost: `${process.env.SERVER_DOMAIN}${process.env.APP_PORT ? `: ${process.env.APP_PORT}` : ''}`,
				},
				{ prefix: '{{', suffix: '}}' }
			)
		)
		.pipe(production ? transform(minifyHTML, { encoding: 'utf8' }) : util.noop())
		.pipe(gulp.dest(paths.build + 'www'));
};

const copyAssetsFontsImages = () => {
	gulp
		.src([paths.www + 'src/connector.js'])
		// .pipe(rename({ basename: 'connector2' }))
		.pipe(gulp.dest(paths.build));

	return gulp
		.src(['assets/fonts/**/*', 'assets/img/**/*'], { base: 'assets' })
		.pipe(changed(paths.build + 'assets'))
		.pipe(print())
		.pipe(gulp.dest(paths.build + 'assets'));
};

const watch = (cb) => {
	gulp.watch([paths.www + 'src/css/**/*', paths.www + 'src/js/**/*', paths.www + 'src/*.html'], updateWww);
	gulp.watch(
		[paths.app + 'src/css/**/*', paths.app + 'src/js/**/*', paths.app + 'src/*.html', paths.app + 'src/*.js'],
		updateApp
	);
	gulp.watch(['assets/fonts/**/*', 'assets/img/**/*'], copyAssetsFontsImages);
	cb();
};

const connectServer = (cb) => {
	connect.server(
		{
			name: 'Console.Re WWW Dev',
			host: process.env.APP_DOMAIN || '0.0.0.0',
			port: process.env.APP_PORT || 80,
			root: paths.build,
			fallback: paths.build + paths.app + 'consoleapp.html',
			debug: true,
			middleware: () => {
				return [rewriteModule.getMiddleware([{ from: '^/$', to: '/www/index.html' }], { verbose: false })];
			},
			livereload: false,
		},
		function () {
			this.server.on('start', () => {
				open(`http://localhost:${process.env.APP_PORT}`, { app: ['google chrome'] });
				cb();
			});
		}
	);
	livereload.listen();
};

const buildAppJsVendors = (cb) =>
	pump(
		[
			// vendors bundle
			gulp.src([
				paths.app + 'src/libs/jquery-2.2.4.min.js',
				paths.app + 'src/libs/storage.livestamp.transit.magnific-popup.hoverIntent.min.js',
			]),
			print(),
			concat('app-js-vendors.js'),
			rev(),
			gulp.dest(paths.build + 'app/js'),
			rev.manifest(manifest, {
				merge: true,
			}),
			gulp.dest('.'),
		],
		cb
	);

const buildAppJsLastVendors = (cb) => {
	pump(
		[
			// vendors bundle
			gulp.src([
				paths.app + 'src/libs/highlightjs.min.js',
				paths.app + 'src/libs/bbcodes.fastclick.style.min.js',
				paths.app + 'src/libs/totop.easing.min.js',
			]),
			print(),
			concat('app-js-last-vendors.js'),
			rev(),
			gulp.dest(paths.build + 'app/js'),
			rev.manifest(manifest, {
				merge: true,
			}),
			gulp.dest('.'),
		],
		cb
	);
};

const buildAppJs = (cb) => {
	pump(
		[
			gulp.src([paths.app + 'src/js/consoleapp.js']),
			print(),
			replaceTemplate(
				{
					consoleServer: process.env.APP_CONNECT_HOST,
				},
				{ prefix: '{{', suffix: '}}' }
			),
			production ? uglify() : util.noop(),
			// production ? rename({suffix: '-bundle.min'}) : rename({suffix: '-bundle'}),
			rev(),
			gulp.dest(paths.build + 'app/js'),
			rev.manifest(manifest, {
				merge: true,
			}),
			gulp.dest('.'),
		],
		cb
	);
};

const buildAppCss = (cb) => {
	pump(
		[
			gulp.src(paths.app + 'src/css/consoleapp.css'),
			print(),
			production ? cssmin({ rebase: false })  : util.noop(),
			rev(),
			gulp.dest(paths.build + 'app/css'),
			rev.manifest(manifest, {
				merge: true,
			}),
			gulp.dest('.'),
		],
		cb
	);
};

const updateAppHtml = () => {
	const manifestFile = gulp.src('./' + manifest);

	return gulp
		.src(paths.app + 'src/*.html')
		.pipe(print())
		.pipe(revReplace({ manifest: manifestFile }))
		.pipe(
			replaceTemplate(
				{
					consoleVersion: version,
					env: production ? 'production' : 'development',
				},
				{ prefix: '{{', suffix: '}}' }
			)
		)
		.pipe(production ? util.noop() : htmlreplace({ liveReload: '//localhost:35729/livereload.js?snipver=1' }))
		.pipe(production ? transform(minifyHTML, { encoding: 'utf8' }) : util.noop())
		.pipe(gulp.dest(paths.build + 'app'));
};

const buildApp = gulp.series(
	clearAppBuild,
	buildAppJsVendors,
	buildAppJsLastVendors,
	buildAppJs,
	buildAppCss,
	updateAppHtml,
	copyAssetsFontsImages
);

const updateApp = gulp.series(
	clearAppBuild,
	buildAppJs,
	buildAppJsVendors,
	buildAppJsLastVendors,
	buildAppCss,
	updateAppHtml,
	reload
);

const buildWWW = gulp.series(clearWwwBuild, buildJs, buildJsVendors, buildCss, updateHtml, copyAssetsFontsImages);

const updateWww = gulp.series(clearWwwBuild, buildJs, buildJsVendors, buildCss, updateHtml, reload);

const dev = gulp.series(buildWWW, buildApp, gulp.parallel(connectServer, watch));

const build = gulp.series(buildWWW, buildApp);

function minifyHTML(html) {
	return htmlminifier.minify(html, {
		removeComments: true,
		removeCommentsFromCDATA: true,
		collapseWhitespace: true,
		collapseBooleanAttributes: true,
		removeAttributeQuotes: true,
		removeEmptyAttributes: true,
	});
}

gulp.task('default', dev);
gulp.task('build', build);
gulp.task('buildWWW', buildWWW);
