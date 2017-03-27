import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#F5FCFF',
  },
  helpModalRoot: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuModalRoot: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  helpModalContent: {
    width: 340,
    marginTop: 7,
    backgroundColor: 'white',
    alignSelf: 'center',
  },
  helpModalContentText: {
    padding: 10,
    paddingTop: 5,
    lineHeight: 15,
    fontWeight: 'bold',
  },
  menuModalContent: {
    width: 300,
    marginTop: 10,
    backgroundColor: 'white',
    alignSelf: 'center',
  },
  item: {
    height: 40,
    borderWidth: 2,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    paddingLeft: 10,
  },
  helpModalCloseButton: {
    marginBottom: 10,
    width: 150,
    height: 45,
    backgroundColor: 'lightblue',
    alignSelf: 'center',
    borderRadius: 4,
  },
  helpModalCloseButtonText: {
    alignSelf: 'center',
    marginTop: 12,
    fontWeight: 'bold',
  },
  itemText: {
    fontSize: 25,
  },
  itemDone: {
    backgroundColor: 'lightgreen',
  },
  itemTouched: {
    backgroundColor: 'lightblue',
  },
  itemRemove: {
    backgroundColor: 'red',
  },
  itemFlashy: {
    backgroundColor: 'green',
  },
  buttons: {
    flexDirection: 'row',
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    borderWidth: 2,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    flex: 1,
    height: 45,
    backgroundColor: '#7de4ff',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderTopWidth: 0,
    borderBottomWidth: 2,
    height: 45,
    backgroundColor: '#7de4ff',
  },
  newListButton: {
    borderRightWidth: 0,
  },
  addButtonText: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: 'bold',
    paddingLeft: 5,
    paddingRight: 5,
  },
  newItemInput: {
    flex: 1,
    backgroundColor: 'white',
  },
  textInputStyleAddEditItem: {
    color: 'black',
    backgroundColor: 'white',
    height: 45,
  },
});

styles.itemColors = {
  inactive: 'white',
  checked: 'lightgreen',
  remove: 'red',
  active: 'lightblue',
  alreadyExists: 'green',
};
export default styles;
