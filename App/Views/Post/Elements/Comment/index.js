import React, {
    StyleSheet,
    Text,
    View,
    TouchableHighlight,
    Component
} from 'react-native';

let api = require("../../../../Network/api.js");

class Comment extends Component {

    get displayName() {
        return 'Comment';
    }

    constructor(props) {
        super(props);
        this.state = {
            subCommentsLoading: false,
            subCommentsHidden: true,
            subCommentsData: null,
            level: this.props.level ? this.props.level : 1
        };
    }

    render() {
        return (
            <View style={styles.commentOuterContainer}>
                <View
                    style={[styles.commentInnerContainer, {marginLeft: this.state.level == 1 ? 10 : 20*this.state.level}]}>
                    <Text style={styles.commentBy}>
                        {this.props.data.by}:
                    </Text>
                    <Text style={styles.commentText}>
                        {this.fixCommentText(this.props.data.text)}
                    </Text>
                    {this.renderRepliesControlButton.bind(this)}
                </View>
                {this.renderSubComments.bind(this)}
            </View>
        );
    }

    /**
     * 查看回复
     * @returns {XML}
     */
    getRepliesControlButtonText() {
        if (!this.state.subCommentsHidden) {
            return (
                <Text style={styles.showRepliesButtonText}>
                    Hide Replies
                </Text>
            );
        }
        else {
            return (
                <Text style={styles.showRepliesButtonText}>
                    Show Replies ({this.props.data.kids.length})
                </Text>
            );
        }
    }

    /**
     * 渲染回复视图
     * @returns {XML}
     */
    renderRepliesControlButton() {
        if (this.state.subCommentsLoading) {
            return (
                <Text style={styles.showRepliesButtonText}>
                    Loading Replies...
                </Text>
            );
        }
        if (this.props.data.kids) {
            return (
                <TouchableHighlight onPress={()=>this.onShowReplies.bind(this)}
                                    style={styles.showRepliesButton}
                                    underlayColor='#F6F6EF'>
                    {this.getRepliesControlButtonText.bind(this)}
                </TouchableHighlight>
            );
        }
        else {
            return (<View />);
        }
    }

    /**
     * 渲染子回复内容
     * @returns {XML}
     */
    renderSubComments() {
        if (!this.state.subCommentsData || this.state.subCommentsHidden) {
            return (<View/>);
        }
        return (
            <View>
                {
                    this.state.subCommentsData.map(
                        subComment =>
                            <Comment data={subComment} level={this.state.level+1} key={subComment.count}/>
                    )
                }
            </View>
        );
    }

    /**
     * 显示回复点击处理
     */
    onShowReplies() {
        if (this.state.subCommentsData && this.state.subCommentsHidden) {
            this.setState({
                subCommentsHidden: false
            });
        }
        else if (this.state.subCommentsData && !this.state.subCommentsHidden) {
            this.setState({
                subCommentsHidden: true
            });
        }
        else {
            this.setState({
                subCommentsLoading: true
            });
            var subCommentIDs = this.props.data.kids;
            var subCommentsData = [];
            var index = 0;
            var _this = this;

            function iterateAndFetch() {
                if (index < subCommentIDs.length) {
                    fetch(api.HN_ITEM_ENDPOINT + subCommentIDs[index] + ".json")
                        .then((response) => response.json())
                        .then((item) => {
                            item.count = index + 1;
                            if (!item.deleted) {
                                subCommentsData.push(item);
                            }
                            index++;
                            iterateAndFetch();
                        })
                        .done();
                }
                else {
                    _this.setState({
                        subCommentsLoading: false,
                        subCommentsHidden: false,
                        subCommentsData: subCommentsData
                    });
                    return;
                }
            }

            iterateAndFetch();
        }
    }

    /**
     * 过滤字符
     * @param str
     * @returns {string}
     */
    fixCommentText(str) {
        return String(str).replace(/<p>/g, '\n\n')
            .replace(/&#x2F;/g, '/')
            .replace('<i>', '')
            .replace('</i>', '')
            .replace(/&#x27;/g, '\'')
            .replace(/&quot;/g, '\"')
            .replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)" rel="nofollow">(.*)?<\/a>/g, "$1");
    }
}

const styles = StyleSheet.create({
    commentInnerContainer: {
        flexDirection: 'column',
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 5,
        marginRight: 10,
        marginLeft: 10,
        marginTop: 10,
        padding: 10
    },
    commentOuterContainer: {
        borderColor: '#dedede'
    },
    commentBy: {
        fontSize: 13,
        marginBottom: 3,
        textAlign: 'left',
        color: '#668dc7'
    },
    commentText: {
        fontSize: 13,
        textAlign: 'left',
        color: '#000000'
    },
    showRepliesButtonText: {
        marginTop: 10,
        fontSize: 13,
        textAlign: 'right',
        color: '#FF6600',
        textAlign: 'right'
    }
});

module.exports = Comment;