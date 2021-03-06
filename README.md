# Protofit MVP
[![Build Status](https://travis-ci.org/danielsuo/protofit.svg)](https://travis-ci.org/danielsuo/protofit)

## Set up
- Run ```./install```
- Create ```./config/env.json``` based on the provided example

## TODO
=======
### This week

#### Jake
- Make sure delete buttons get appropriately populated (delete button is created, but removed when we hit 'create new testfit'; suspect it has something to do with adding/removing classes)
- Screen resizing
- Duplicate test fit
- 3D link
- Logout button
- Add special be able to change it
- Show more building data in the right-hand panel (right now, just suite name)
- Figure out why export to 0 width happens

#### Daniel
- Visiting routes (via refresh) doesn't crash app if doesn't exist
- Remove save fail route
- Buffer / store changes until hit save
- Update legend (e.g,. work, collab, support, ratios, other metrics)
- Add routes for editing special in layout
- Testfit viewing route
- Guarantee prepopulate order
- If don't choose a layout when creating new, shouldn't set to whitebox

#### Both
- Cubicle layer
- Browser compatibility
- iPad
- No internet case

- CMS tools
  - Save as preset
  - Enter number of seats
- DXF -> SVG processing

- Protofit brandmark everywhere / nav bar
- /404
- Don't crash when deleting current testfit
- Flash after print 
- PDF blackness
- Create bounding for SVG so it doesn't squash other stuff
- Fix drawing paths
- Better CMS editing
- Cell types in layout
- Upgrade existing plans
- Don't deselect all when replacing one cell with another?
  - ESB
  - Beacon
- Refactor whitebox and layers
- Investigate line weights
- Refactor front-end data model to mirror backend data model
- Walls as own layer
- Refactor server and client-side routes
- Link to specific testfit
- Need cell for reception
- Load font faster
- Refactor layers to use ID and not array index
- Refactor seating
- Refactor cell state (e.g., combine static, layer, disabled)
- Remove merge cell borders when unmerged
- Add doors
- Center to visual center
- Merge to merge
- Figure out real world coordinates
- Fix drawing of large merges
- Recursive splitting
- Fix being able to merge multiple tiles
- Pretty urls
- Cache user organization so we don't check each time something happens
- Create CellList, Cell, Layout, and Layer schema?
- Flash on save success/fail

- Multiline addresses
- Move unmoveable cells (e.g., reception, pantry) to own layer
  - Add disabled layers
  - Remove for whitebox
- Users
  - Floored admin: can do everything
  - Org admin: can do everything within organization
  - User: can do everything but add other users within organization (can we kill?)
  - Users belong to organizations; permissions check if in organization and role
- Trailing slash routing problem
- Active demising checkbox
- Set up permissions for different groups
- Google analytics
- Other analytics?
- Set up s3 + authentication
- Migrations
  - [mongodb-migrations](https://github.com/emirotin/mongodb-migrations)
  - [mongo-migrate](https://github.com/afloyd/mongo-migrate)
  - [mongoose-data-migrations](https://github.com/InterNACHI/mongoose-data-migrations)
  - [mongoose-migrate](https://github.com/madhums/mongoose-migrate)
  - [migrate](https://github.com/tj/node-migrate)
  - [mongoose-rolling-migration](https://github.com/kennethklee/mongoose-rolling-migration)
  - [mongoose-lazy-migration](http://cnpmjs.org/package/mongoose-lazy-migration)
- Deploying migrations

## Done
- Don't deselect after editing
- Cells not disabling
- Refactor list of buttons
- Prepopulate user-defined testfits when onboarding new suite
- Upgrade beacon
- Be able to select after making new test fit
- /app
- /home
- Saving / loading test fits
- Add home page
- Split up preset vs layout; can't edit preset?
- Edit name not working
- Empty cell highlighting
- / + /login
- Cell counts
- Fix whitebox
- Add 'suite' in front of suite number in show
- Project creation script
- Redesign app layout
- List of test fits
- Update furniture blocks
- protofit-dev, protofit-staging, protofit
- Refactor disabled cell
- Merge the merge conference buttons
- Set up routes
- Make sure special is getting correct color
- Check on n00b cell
- Fix printinfo
- Take out 'static'
- Add cell for reception
- draw merged cells
- Show reception / pantry
- fix cells
- Deselect cells
- Disabled cells
- Merge UI
- Print.css
- Request change
- Deploy
- Print.css
- Get/set layout with merged
- Merging
- Merge rules
- Pre-configured merge
- logo
- Name and address
- Deselect cells upon selection after updating cell type
- Print to pdf
- add the badges
- Set up nunjucks
- set up nodemon
- set up gulp + restart on self
- Set up stylus
- Set up browserify
- Set up mongoose
- Set up mongo + add to install / readme
- Set up environment variables
- Set up travis
- Set up heroku
- Set up users
- Drop in protofit
- Relationships
- Create models (orgs, buildings, floors, suite arrangements, suites)
- Deal with window resizing
- Support merging in data structure (not necessarily implement)
- White-box button
- Hook up cell change buttons

## On the radar
- Publish vs draft? Who gets to see my work?
- Only chrome works
- Hover cell info
- Fallbacks
- Sharing (e.g., email; printable page)
- Investigate pan/zoom
- Benching types (density)
- Add pop-up when mousing over cell?
- Debug mode that has cell #
- Indicate how many people would be added / removed
- Merge cells
- Undo / redo
- Use gulp-watch, not gulp.watch
- [Browser events](https://github.com/mudcube/Event.js)
- Add disclaimer (close, not represent)
- Modules
- Don't redraw cells on reset; unclip and change color instead
- Add compass [here](http://ai.github.io/compass.js/)
- Share multiple floor plans
- Fix drag out of window, still mousedown bug
- Measure tools for distances and areas

## Ideas that improve file size
- SVG defs to reuse definition of icons
- Minify and optimize svg via svgo
- Turn elements into a single large path
- Gzip SVGs

## Ideas that improve performance
- https://blog.idrsolutions.com/2014/11/6-tips-optimising-svg-files/
- Render SVG icons with icon fonts. Example [here](http://frozeman.de/blog/2013/08/why-is-svg-so-slow/).
  - Cross-browser icon fonts [here](http://www.filamentgroup.com/lab/bulletproof_icon_fonts.html)
  - Pros and cons [here](http://cubicleninjas.com/icon-fonts-explained-benefits-pitfalls/)
  - Image sprites vs icon fonts [here](http://www.jontetzlaff.com/blog/2013/04/29/image-sprites-vs-web-icon-fonts/)
- Reduce number of redraws
- Reusing symbols? Example [here](http://stackoverflow.com/questions/8604999/does-reusing-symbols-improve-svg-performance)
- Use CSS transforms on HTML element holding SVG, not on SVG directly
- Use rounded coordinates. Example [here](https://www.mapbox.com/osmdev/2012/11/20/getting-serious-about-svg/)
- Use rasterized images wherever possible
- http://calendar.perfplanet.com/2014/tips-for-optimising-svg-delivery-for-the-web/
- Don't parse then draw svg; draw directly when possible

## Ideas that improve both performance and file size
- Use CSS to style SVG elements, rather than per-element styling
- Cut up SVG layers into cells and only load what is needed
- Remove unnecessary layers and paths
- Use SVG to represent blocks and floor plan only
- [√] Draw background as image / don't use SVG.js to render -> use browser to render
- Store object locations rather than all data for how an object looks (lends well to using SVG refs)
- Canvas?