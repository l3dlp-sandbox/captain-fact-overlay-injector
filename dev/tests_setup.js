import Enzyme, { shallow, render, mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import jsdomGlobal from 'jsdom-global'


// Initialize the global DOM
jsdomGlobal()

// React 16 Enzyme adapter
Enzyme.configure({ adapter: new Adapter() })

// Make Enzyme functions available in all test files without importing
global.shallow = shallow
global.render = render
global.mount = mount

// Add a helper to register snapshot
global.snapshot = component => expect(shallow(component)).toMatchSnapshot()

