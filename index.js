// 递归子节点
getNode(list) {
    list = list || [];
    return list.map((data) => {
        return (
            <TreeNode title={data.labelName} record={data} key={data.id} value={data.id} >
                {
                    data.children && this.getNode(data.children)
                }
            </TreeNode>
        );
    });
};