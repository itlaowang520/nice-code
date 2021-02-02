<DND
                    onRender={(data, index) => {
                        return (

                            <div
                                onClick={() => {
                                    this.showConfig(index);
                                }}
                                className='page-item'
                            >
                                {this.renderComponent(data)}
                                <div className='item-close'
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        Confirm({
                                            title: '请确认删除组件',
                                            content: '删除后其配置会消失，请谨慎操作',
                                            onOk: () => {
                                                this.setJSON({
                                                    components: dataSource.filter((record, idx) => idx !== index)
                                                });
                                            }
                                        })
                                    }}
                                >
                                    <Icon type='close-circle' className='item-close-icon' />
                                </div>
                            </div>
                        );
                    }}
                    dataSource={dataSource}
                    onDragStart={() => {}}
                    onDragEnd={dataSource => {
                        this.setJSON({
                            components: dataSource
                        });
                    }}
                />