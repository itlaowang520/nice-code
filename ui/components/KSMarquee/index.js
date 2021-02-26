import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
let timer;

export default class KSMarquee extends PureComponent {
  static propTypes = {
      speed: PropTypes.number,
      direction: PropTypes.string,
      style: PropTypes.object,
      children: PropTypes.oneOfType([
          PropTypes.element,
          PropTypes.array
      ])
  }

  state = {
      speed: this.props.speed || 10, // 滚动速率，可传入，默认10毫秒
      direction: this.props.direction || 'top', // 滚动方向
      container: null, // 容器DOM
      content: null, // 内容DOM
      clone: null, // 克隆DOM
  }

  // 实现滚动
  rolling = () => {
      const { container, content, clone, direction } = this.state;
      clone.innerHTML = content.innerHTML; // 克隆一份
      switch (direction) {
          case 'top':
              if (container.scrollTop === clone.offsetTop) {
                  container.scrollTop = 0;
              } else {
                  container.scrollTop++;
              }
              break;
          case 'bottom':
              if (container.scrollTop === 0) {
                  container.scrollTop = clone.offsetTop;
              } else {
                  container.scrollTop--;
              }
              break;
          case 'left':
              if (container.scrollLeft === clone.offsetLeft) {
                  container.scrollLeft = 0;
              } else {
                  container.scrollLeft++;
              }
              break;
          case 'right':
              if (container.scrollLeft === 0) {
                  container.scrollLeft = clone.offsetLeft;
              } else {
                  container.scrollLeft--;
              }
              break;
          default:
      }
  };

  // 开始滚动
  startMarquee = () => {
      const { speed } = this.state;
      timer = setInterval(this.rolling, speed); // 设置定时器
  };

  // 停止滚动
  stopMarquee = () => {
      clearInterval(timer);
  }

  componentDidMount() {
      const { direction } = this.state;
      if (direction === 'left' || direction === 'right') {
          require('./horizontal.scss');
      } else {
          require('./vertical.scss');
      }
      let container = document.querySelector('.marquee'),
          content = container.querySelector('.content'),
          clone = container.querySelector('.clone');
      this.setState({
          container,
          content,
          clone
      }, () => {
          this.startMarquee();
      });
      container.addEventListener('mouseover', this.stopMarquee, false);
      container.addEventListener('mouseout', this.startMarquee, false);
  }

  componentWillUnmount() {
      const { container } = this.state;
      clearInterval(timer);
      container.removeEventListener('mouseover', this.stopMarquee, false);
      container.removeEventListener('mouseout', this.startMarquee, false);
  }

  render() {
      const { direction } = this.state;
      let renderDom;
      if (direction === 'top' || direction === 'bottom') {
          renderDom = <div className='marquee' style={this.props.style || {}}>
              <div className='content'>
                  {this.props.children}
              </div>
              <div className='clone'></div>
          </div>;
      }
      if (direction === 'left' || direction === 'right') {
          renderDom = <div className='marquee' style={this.props.style || {}}>
              <div className='container'>
                  <div className='content'>
                      {this.props.children}
                  </div>
                  <div className='clone'></div>
              </div>
          </div>;
      }
      return (
          renderDom
      );
  }
}
