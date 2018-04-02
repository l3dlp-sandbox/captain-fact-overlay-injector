import 'isomorphic-fetch'
import React from 'react'
import { connect } from 'react-redux'
import debounce from 'debounce'
import classNames from 'classnames'

import CFButton from '../CFButton/CFButton'
import Sidebar from '../Sidebar/Sidebar'
import { fetchVideo } from '../Video/effects'

import styles from './App.css'
import { InterfaceState } from './interface_reducer'


const SIZE_REGEX = /(\d+)(px|em|rem)$/
const BASE_CONTAINER_SIZE = 800
const BASE_DIM = 800*450
const MAX_DIM = 1920*1080
const MIN_RATIO = 1
const MAX_RATIO = 1.5
const SIZE_THRESHOLDS = {
  0: 'cf_xmobile',
  769: 'cf_xtablet',
  1024: 'cf_xdesktop',
  1216: 'cf_xwidescreen',
  1408: 'cf_xfullhd'
}

@connect(state => ({video: state.Video.data, config: state.Configuration, forceResize: state.Interface.forceResize}))
export default class App extends React.PureComponent {
  constructor(props) {
    super(props)
    this.onResize = debounce(this.onResize.bind(this), 200)
    this.state = {forceResize: null}
  }

  componentDidMount() {
    fetchVideo(this.props.videoUrl)
    if (this.props.config.app.autoSize) {
      window.addEventListener('resize', this.onResize)
      window.addEventListener('onfullscreenchange', this.onResize)
    }
  }

  componentWillUnmount() {
    if (this.props.config.app.autoSize) {
      window.removeEventListener('resize', this.onResize)
      window.removeEventListener('onfullscreenchange', this.onResize)
    }
  }

  render() {
    if (!this.props.video)
      return <div style={{display: "none"}}/>
    else
      return (
        <div className={classNames(styles.app, this.getScreenType())}
             style={{fontSize: this.getSize()}}>
          {this.props.config.app.display === 'overlay' &&
          <CFButton onClick={InterfaceState.openSidebar}/>
          }
          <Sidebar video={this.props.video} player={this.props.player}/>
        </div>
      )
  }

  onResize() {
    this.setState({forceResize: Date.now()})
  }

  getScreenType() {
    const containerWidth = this.props.container.offsetWidth
    let screenType
    for (let threshold in SIZE_THRESHOLDS) {
      if (containerWidth < threshold)
        break;
      screenType = SIZE_THRESHOLDS[threshold]
    }
    return screenType
  }

  getSize() {
    const parsedSize = SIZE_REGEX.exec(this.props.config.app.baseSize)
    if (!parsedSize)
      return this.props.config.app.baseSize
    const modifierRatio = Math.min(((this.props.container.offsetWidth*this.props.container.offsetHeight-BASE_DIM) * (MAX_RATIO-MIN_RATIO) / (MAX_DIM-BASE_DIM)) + MIN_RATIO, MAX_RATIO);
    const size = parseInt(parsedSize[1]) * modifierRatio
    return `${size}${parsedSize[2]}`
  }
}