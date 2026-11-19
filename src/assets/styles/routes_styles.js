import { StyleSheet, Platform ,Dimensions} from 'react-native';
var { height, width } = Dimensions.get('window');
export default StyleSheet.create({
    container: {
        flex: 1,
      },
      scene: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 12,
        },
        shadowOpacity: 0.58,
        shadowRadius: 16.0,
    
        elevation: 24,
        backgroundColor: 'transparent',
      },
      stack: {
        flex: 1,
        shadowColor: '#FFF',
        shadowOffset: {
          width: 0,
          height: 8,
        },
        shadowOpacity: 0.44,
        shadowRadius: 10.32,
        elevation: 5,
        overflow: 'hidden',
      },
      drawerStyles: { flex: 1, width: '67%', backgroundColor: 'transparent' },
      menu: {
        width: 38,
        height: 38,
        margin: 20,
      },
      drawerLblStyle: {
        fontWeight: '500',
        fontSize: 20,
      },
      menuBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: height / 75,
        borderRadius: 8,
        paddingLeft: height / 20,
        marginTop: height / 80
      },
      menuBtn1: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: height / 75,
        borderRadius: 8,
        paddingLeft: height / 20,
        marginTop: height / 90
      },
      menuTitle: {
        fontSize: width / 27,
        fontWeight: '400',
        paddingLeft: height / 45,
        color: 'white'
      },
      card: {
        //height: height / 8,
        // width: height / 3.2,
        //marginTop: width / 17,
        //marginLeft: width / 20,
        //backgroundColor: '#C4C4C4',
        //opacity: 0.2,
        height: height / 5.8,
        width: height / 3.1,
        marginTop: width / 25,
        marginLeft: width / 19,
        backgroundColor: '#C4C4C4',
        opacity: 0.2,
      },
      collapseText: {
        color: 'white', fontSize: width / 27
      },
      logoutTxt: {
        fontSize: width / 27,
        fontWeight: '400',
        paddingLeft: height / 45,
        color: '#FFFFFF'
      },
      logoutBtn: {
        backgroundColor: '#006A96',
        borderRadius: 40,
        width: width / 3,
        height: width / 8,
        alignItems: 'center',
        justifyContent: 'center',
        //marginTop: width / 2.5,
        marginLeft: width / 25,
        flexDirection: 'row',
        alignItems: 'center'
      },
      line:{ borderBottomWidth: 1, opacity: .6, borderBottomColor: 'white', width: width / 1.8, alignSelf: 'center', }
})