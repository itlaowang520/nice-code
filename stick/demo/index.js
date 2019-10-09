import React, { Component } from 'react';
import './style.scss';
import Anchor from '../components/anchor';
export default class extends Component {
    state = {
        anchorList: [
            {
                anchorName: '测试Nav1号',
                imgUrl: 'https://tcdn.kaishustory.com/kstory/pop/image/5fd071e9-1c5d-4ce3-98f1-25b5cbd6ac0b.jpg'
            },
            {
                anchorName: '测试Nav2号',
                imgUrl: '//cdn.kaishuhezi.com/kstory/story/image/8c8de05f-20f8-4cdd-8d6b-c4244faab0a4.jpg'
            },
            {
                anchorName: '测试Nav3号',
                imgUrl: 'https://cdn.kaishuhezi.com/kstory/story/image/cd42cc6e-8b8e-4a0d-9dd1-975e8edc283d.png'
            },
            {
                anchorName: '测试Nav4号',
                imgUrl: '//cdn.kaishuhezi.com/kstory/story/image/8c8de05f-20f8-4cdd-8d6b-c4244faab0a4.jpg'
            },
        ]
    }

    render() {
        // const { productId, actItem } = this.state;
        return (
            <div>
                <Anchor
                    header={<img src="https://tcdn.kaishustory.com/kstory/activity/image/814ebf9a-c49f-4feb-ae86-e8e5b7199d72.jpg" />}
                    navStyle={{
                        navContainerStyle: {
                            backgroundColor: '#fff',
                            color: '#000',
                            height: '5rem',
                            borderRadius: '10px',
                            // padding: '10px'
                        },
                        navContentStyle: {
                            fontSize: '1.2rem'
                        },
                        navActiveStyle: {
                            borderBottom: '0.3rem #fff solid',
                            fontSize: '1.5rem',
                            color: '#ffeca5'
                        }
                    }}
                >
                    {
                        this.state.anchorList.map((anchor, index) => {
                            return (
                                <div key={index} name={anchor.anchorName}>
                                    <img src={anchor.imgUrl} />
                                </div>
                            );
                        })
                    }
                </Anchor>
            </div>
        );
    }
}
