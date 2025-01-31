import { msg } from '../i18n'
import { requestPageMediaInfo } from '../api'
import { isOnline } from '../utils'

// internal state of the slider component
let current = 0,
	dir = '',
	lang,
	gallery,
	parentContainer

const clientWidth = window.innerWidth,
	prefixClassname = 'wp-gallery-fullscreen-slider',

	renderImageSlider = ( images = [], selectedImage = '', givenLang, givenDir, container ) => {
		const imageListHtml = images.map( () => `
			<div class="${prefixClassname}-item">
					<div class="${prefixClassname}-item-loading">
							<div class="${prefixClassname}-item-loading-spinner">
									<div class="${prefixClassname}-item-loading-spinner-animation">
											<div class="${prefixClassname}-item-loading-spinner-animation-bounce"></div>
									</div>
							</div>
							<div class="${prefixClassname}-item-loading-text">${msg( givenLang, 'gallery-loading-still' )}</div>
					</div>
					<div class="${prefixClassname}-item-loading-error">
						<div class="${prefixClassname}-item-loading-error-text">${msg( givenLang, 'gallery-loading-error' )}</div>
						<div class="${prefixClassname}-item-loading-error-refresh">${msg( givenLang, 'gallery-loading-error-refresh' )}</div>
					</div>
			</div>
			`.trim()
		).join( '' )

		images.some( ( image, index ) => {
			if ( image.thumb === selectedImage ) {
				current = index
				return true
			}
			return false
		} )
		dir = givenDir
		lang = givenLang
		gallery = images
		parentContainer = container

		return `
			<div class="${prefixClassname}" style="${dir === 'ltr' ? 'margin-left' : 'margin-right'}:-${current * clientWidth}px">
					<div class="${prefixClassname}-button previous"></div>
					<div class="${prefixClassname}-button next"></div>
					${imageListHtml}
			</div>
			`.trim()
	},

	renderImageInfo = ( mediaInfo, image, lang ) => {
		const getImageDescription = () => {
				// description list order
				// (1) commons caption - Not found
				// (2) commons description
				// (3) media-list caption
				if ( mediaInfo.description ) {
					return mediaInfo.description
				} else if ( image.caption ) {
					return image.caption
				} else {
					return ''
				}
			},

			getLicenseInfo = ( license ) => {
				const licenseTypes = [ 'CC', 'BY', 'SA', 'Fair', 'Public' ]
				let licenses = ''
				licenseTypes.forEach( type => {
					if ( license && license.indexOf( type ) !== -1 ) {
						licenses += `<div class="${prefixClassname}-item-attribution-info-${type.toLowerCase()}"></div>`
					}
				} )
				return licenses
			},

			author = mediaInfo.author ? mediaInfo.author : msg( lang, 'gallery-unknown-author' ),
			link = mediaInfo.filePage,
			description = getImageDescription(),

			isCaptionExpandable = () => {
				if ( clientWidth < 400 && description.length > 128 ) {
					return true
				} else if ( clientWidth > 400 && description.length > 142 ) {
					return true
				} else {
					return false
				}
			}

		// @todo consider a wrapper container for all the image info?
		return `
			<div class="${prefixClassname}-item-caption">
				${isCaptionExpandable() ? `<div class="${prefixClassname}-item-caption-expand-cue"></div>` : ''}
				${ description ? `<div class="${prefixClassname}-item-caption-text">${description}</div>` : ''}
			</div>
			<div class="${prefixClassname}-item-attribution">
				<div class="${prefixClassname}-item-attribution-info">
					${getLicenseInfo( mediaInfo.license )}
					${ author ? `<div class="${prefixClassname}-item-attribution-info-author">${author}</div>` : ''}
				</div>
				${ link ? `<div class="${prefixClassname}-item-attribution-more-info">
					<a href="${link}" class="${prefixClassname}-item-attribution-more-info-link" target="_blank"></a>
				</div>` : '' }
			</div>
		`.trim()
	},

	bindImageEvent = ( container, refresh = false ) => {
		const imageElement = container.querySelector( 'img' ),
			loading = container.querySelector( `.${prefixClassname}-item-loading` ),
			errorElement = container.querySelector( `.${prefixClassname}-item-loading-error` )

		if ( refresh ) {
			const slider = parentContainer.querySelector( `.${prefixClassname}` ),
				items = slider.querySelectorAll( `.${prefixClassname}-item` )

			items.forEach( item => {
				const image = item.querySelector( 'img' ),
					caption = item.querySelector( `.${prefixClassname}-item-caption` ),
					attribution = item.querySelector( `.${prefixClassname}-item-attribution` )
				if ( image ) {
					item.removeChild( image )
				}
				if ( caption ) {
					item.removeChild( caption )
				}
				if ( attribution ) {
					item.removeChild( attribution )
				}
			} )

			// eslint-disable-next-line no-use-before-define
			renderNext( 0, true )
			loading.style.visibility = 'visible'
			errorElement.style.visibility = 'hidden'
		}

		if ( imageElement.complete ) {
			loading.style.visibility = 'hidden'
			errorElement.style.visibility = 'hidden'
			imageElement.style.visibility = 'visible'
		} else {
			const textElement = container.querySelector( `.${prefixClassname}-item-loading-text` ),
				timeoutId = setTimeout( () => {
					textElement.style.visibility = 'visible'
				}, 5000 )

			imageElement.addEventListener( 'load', () => {
				loading.style.visibility = 'hidden'
				errorElement.style.visibility = 'hidden'
				textElement.style.visibility = 'hidden'
				clearTimeout( timeoutId )
			} )

			imageElement.addEventListener( 'error', () => {
				const refreshElement = container.querySelector( `.${prefixClassname}-item-loading-error-refresh` )
				loading.style.visibility = 'hidden'
				imageElement.style.visibility = 'hidden'

				if ( !isOnline() ) {
					const errorElementText = container.querySelector( `.${prefixClassname}-item-loading-error-text` )
					errorElementText.innerText = msg( lang, 'gallery-loading-error-offline' )
					errorElement.classList.add( 'offline' )
				}
				errorElement.style.visibility = 'visible'
				clearTimeout( timeoutId )

				refreshElement.addEventListener( 'click', () => {
					bindImageEvent( container, true )
				} )
			} )
		}
	},

	handleCaptionExpansion = ( item, forceClose = false ) => {
		const captionText = item.querySelector( `.${prefixClassname}-item-caption-text` ),
			expandCue = item.querySelector( `.${prefixClassname}-item-caption-expand-cue` ),
			expanded = item.querySelector( '.expanded' )

		if ( expandCue && expanded || forceClose && expandCue ) {
			expandCue.classList.remove( 'expanded' )
			captionText.style.maxHeight = '80px'
		} else if ( expandCue ) {
			expandCue.classList.add( 'expanded' )
			captionText.style.maxHeight = '241px'
		}
	},

	showImageAndInfo = ( index, refreshImage = false ) => {
		const slider = parentContainer.querySelector( `.${prefixClassname}` ),
			items = slider.querySelectorAll( `.${prefixClassname}-item` ),
			item = items[ index ]

		if ( item ) {
			requestPageMediaInfo(
				lang,
				gallery[ index ].title,
				gallery[ index ].fromCommon,
				mediaInfo => {
					const imageElement = item.querySelector( 'img' ),
						captionElement = item.querySelector( `.${prefixClassname}-item-caption` )

					if ( !imageElement ) {
						if ( !refreshImage ) {
							item.insertAdjacentHTML( 'beforeend', `<img src="${mediaInfo.bestFitImageUrl}"/>` )
						} else {
							item.insertAdjacentHTML( 'beforeend', `<img src="${mediaInfo.bestFitImageUrl}?timestamp=${Date.now()}"/>` )
						}
						bindImageEvent( item )
					}

					if ( !captionElement ) {
						item.insertAdjacentHTML(
							'beforeend',
							renderImageInfo( mediaInfo, gallery[ index ], lang
							) )

						const insertedCaption = item.querySelector( `.${prefixClassname}-item-caption` )

						insertedCaption.addEventListener( 'click', () => {
							handleCaptionExpansion( item )
						} )
					}
				} )
		}
	},

	renderNext = ( offset = 1, refresh = false ) => {
		const slider = parentContainer.querySelector( `.${prefixClassname}` ),
			items = slider.querySelectorAll( `.${prefixClassname}-item` ),
			nextButton = slider.querySelector( '.next' ),
			previousButton = slider.querySelector( '.previous' ),
			next = current + offset,
			item = items[ next ]

		if ( item ) {
			handleCaptionExpansion( items[ current ], true )
			current += offset
			nextButton.style.opacity = current === items.length - 1 ? '0.5' : '1'
			previousButton.style.opacity = current === 0 ? '0.5' : '1'

			// render image attribution element - current, next, previous
			showImageAndInfo( current, refresh )
			showImageAndInfo( current + 1, refresh )
			showImageAndInfo( current - 1, refresh )
		}

		slider.style[ dir === 'ltr' ? 'marginLeft' : 'marginRight' ] = -clientWidth * current + 'px'
	},

	renderPrevious = () => {
		renderNext( -1 )
	},

	applyGestureEvent = () => {
		let temp = {
			screenX: null,
			originalMarginLeft: null,
			currentMarginLeft: null,
			originalTransition: null,
			durationStart: null
		}

		const container = parentContainer.querySelector( `.${prefixClassname}` ),
			marginLR = dir === 'ltr' ? 'marginLeft' : 'marginRight',
			captionText = `${prefixClassname}-item-caption-text`,
			items = container.querySelectorAll( `.${prefixClassname}-item` )

		container.addEventListener( 'touchstart', e => {
			if ( e.target.className === captionText &&
				items[ current ].querySelector( `.${prefixClassname}-item-caption-expand-cue` ) ) {
				return
			}

			const containerStyle = window.getComputedStyle( container )
			temp.durationStart = Date.now()
			temp.screenX = e.touches[ 0 ].clientX
			temp.originalMarginLeft =
                +containerStyle[ marginLR ].slice( 0, -2 )
			temp.currentMarginLeft =
                +containerStyle[ marginLR ].slice( 0, -2 )
			temp.originalTransition = containerStyle.transition
			container.style.transition = 'unset'
		} )
		container.addEventListener( 'touchmove', e => {
			if ( e.target.className === captionText &&
				items[ current ].querySelector( `.${prefixClassname}-item-caption-expand-cue` ) ) {
				return
			}
			const clientX = e.touches[ 0 ].clientX,
				offset = clientX - temp.screenX
			temp.currentMarginLeft = temp.originalMarginLeft + offset * ( dir === 'ltr' ? 1 : -1 )
			container.style[ marginLR ] = temp.currentMarginLeft + 'px'
			e.preventDefault()
		} )
		container.addEventListener( 'touchend', e => {
			if ( e.target.className === captionText &&
				items[ current ].querySelector( `.${prefixClassname}-item-caption-expand-cue` ) ) {
				return
			}
			container.style.transition = temp.originalTransition
			const diff = temp.originalMarginLeft - temp.currentMarginLeft,
				duration = Date.now() - temp.durationStart
			if ( Math.abs( diff / clientWidth ) > 0.4 ||
				( duration <= 300 && Math.abs( diff ) > 5 )
			) {
				renderNext( diff > 0 ? 1 : -1 )
			} else {
				container.style[ marginLR ] = -clientWidth * current + 'px'
			}
		} )
	},

	toggleFocusMode = () => {
		const gallery = parentContainer.querySelector( '.wp-gallery-fullscreen' )
		gallery.classList.toggle( 'wp-gallery-fullscreen-focus-mode' )
	},

	onShowFn = () => {
		const sliderContainer = parentContainer.querySelector( `.${prefixClassname}` ),
			items = sliderContainer.querySelectorAll( `.${prefixClassname}-item` ),
			nextButton = sliderContainer.querySelector( '.next' ),
			previousButton = sliderContainer.querySelector( '.previous' )

		renderNext( 0 )
		applyGestureEvent()

		sliderContainer.addEventListener( 'click', ( e ) => {
			if ( e.target.className === `${prefixClassname}-item` ||
					e.target.tagName === 'IMG' ) {
				toggleFocusMode()
			}
		} )

		if ( items.length === 1 ) {
			previousButton.style.visibility = 'hidden'
			nextButton.style.visibility = 'hidden'
		} else {
			nextButton.addEventListener( 'click', () => {
				renderNext()
			} )
			previousButton.addEventListener( 'click', () => {
				renderPrevious()
			} )
		}
	}

export { renderImageSlider, onShowFn }
