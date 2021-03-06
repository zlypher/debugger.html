/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import React from "react";
import { shallow } from "enzyme";
import { showMenu } from "devtools-contextmenu";

import SourcesTreeItem from "../SourcesTreeItem";
import { createSource } from "../../../reducers/sources";
import { copyToTheClipboard } from "../../../utils/clipboard";

jest.mock("devtools-contextmenu", () => ({ showMenu: jest.fn() }));
jest.mock("../../../utils/clipboard", () => ({
  copyToTheClipboard: jest.fn()
}));

describe("SourceTreeItem", () => {
  afterEach(() => {
    copyToTheClipboard.mockClear();
    showMenu.mockClear();
  });

  it("should show menu on contextmenu of an item", async () => {
    const { instance, component } = render();
    const { item } = instance.props;
    instance.onContextMenu = jest.fn(() => {});

    const event = { event: "contextmenu" };
    component.simulate("contextmenu", event);
    expect(instance.onContextMenu).toHaveBeenCalledWith(event, item);
  });

  describe("onContextMenu of the tree", () => {
    it("shows context menu on directory to set as root", async () => {
      const menuOptions = [
        {
          accesskey: "r",
          click: expect.any(Function),
          disabled: false,
          id: "node-set-directory-root",
          label: "Set directory root"
        }
      ];
      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn()
      };
      const { props, instance } = render({
        projectRoot: "root/"
      });
      await instance.onContextMenu(mockEvent, createMockDirectory());
      expect(showMenu).toHaveBeenCalledWith(mockEvent, menuOptions);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();

      showMenu.mock.calls[0][1][0].click();
      expect(props.setProjectDirectoryRoot).toHaveBeenCalled();
      expect(props.clearProjectDirectoryRoot).not.toHaveBeenCalled();
      expect(copyToTheClipboard).not.toHaveBeenCalled();
    });

    it("shows context menu on file to copy source uri", async () => {
      const menuOptions = [
        {
          accesskey: "u",
          click: expect.any(Function),
          disabled: false,
          id: "node-menu-copy-source",
          label: "Copy source URI"
        }
      ];
      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn()
      };
      const { props, instance } = render({
        projectRoot: "root/"
      });
      const { item } = instance.props;

      await instance.onContextMenu(mockEvent, item);

      expect(showMenu).toHaveBeenCalledWith(mockEvent, menuOptions);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();

      showMenu.mock.calls[0][1][0].click();
      expect(props.setProjectDirectoryRoot).not.toHaveBeenCalled();
      expect(props.clearProjectDirectoryRoot).not.toHaveBeenCalled();
      expect(copyToTheClipboard).toHaveBeenCalled();
    });

    it("shows context menu on root to remove directory root", async () => {
      const menuOptions = [
        {
          click: expect.any(Function),
          disabled: false,
          id: "node-remove-directory-root",
          label: "Remove directory root"
        }
      ];
      const { props, instance } = render({
        projectRoot: "root/"
      });

      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn()
      };

      await instance.onContextMenu(
        mockEvent,
        createMockDirectory("root/", "root")
      );

      expect(showMenu).toHaveBeenCalledWith(mockEvent, menuOptions);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();

      showMenu.mock.calls[0][1][0].click();
      expect(props.setProjectDirectoryRoot).not.toHaveBeenCalled();
      expect(props.clearProjectDirectoryRoot).toHaveBeenCalled();
      expect(copyToTheClipboard).not.toHaveBeenCalled();
    });
  });

  describe("renderItem", () => {
    it("should show icon for webpack item", async () => {
      const item = createMockDirectory("webpack://", "webpack://");
      const node = render({ item });
      expect(node).toMatchSnapshot();
    });

    it("should show icon for angular item", async () => {
      const item = createMockDirectory("ng://", "ng://");
      const node = render({ item });
      expect(node).toMatchSnapshot();
    });

    it("should show icon for moz-extension item", async () => {
      const item = createMockDirectory(
        "moz-extension://e37c3c08-beac-a04b-8032-c4f699a1a856",
        "moz-extension://e37c3c08-beac-a04b-8032-c4f699a1a856"
      );
      const node = render({ item, depth: 0 });
      expect(node).toMatchSnapshot();
    });

    it("should show icon for folder with arrow", async () => {
      const item = createMockDirectory();
      const node = render({ item, source: null });
      expect(node).toMatchSnapshot();
    });

    it("should show icon for folder with expanded arrow", async () => {
      const node = render({
        item: createMockDirectory(),
        source: null,
        depth: 1,
        focused: false,
        expanded: true
      });
      expect(node).toMatchSnapshot();
    });

    it("should show focused item for folder with expanded arrow", async () => {
      const node = render({
        item: createMockDirectory(),
        source: null,
        depth: 1,
        focused: true,
        expanded: true
      });
      expect(node).toMatchSnapshot();
    });

    it("should show source item with source icon", async () => {
      const node = render({ item: createMockItem() });
      expect(node).toMatchSnapshot();
    });

    it("should show source item with source icon with focus", async () => {
      const node = render({
        depth: 1,
        focused: true,
        expanded: false
      });
      expect(node).toMatchSnapshot();
    });

    it("should show domain item", async () => {
      const node = render({
        item: createMockItem("root", "root"),
        depth: 0
      });
      expect(node).toMatchSnapshot();
    });

    it("should show domain item as debuggee", async () => {
      const node = render({
        item: createMockDirectory("root", "http://mdn.com"),
        depth: 0
      });

      expect(node).toMatchSnapshot();
    });

    it("should show domain item as debuggee with focus and arrow", async () => {
      const node = render({
        item: createMockDirectory("root", "http://mdn.com"),
        depth: 0,
        focused: true
      });

      expect(node).toMatchSnapshot();
    });

    it("should not show domain item when the projectRoot exists", async () => {
      const { node } = render({
        projectRoot: "root/"
      });
      expect(node).toMatchSnapshot();
    });

    it("should focus on and select item on click", async () => {
      const event = { event: "click" };
      const setExpanded = jest.fn();
      const selectItem = jest.fn();
      const { component, instance, props } = render({
        depth: 1,
        focused: true,
        expanded: false,
        setExpanded,
        selectItem
      });

      const { item } = instance.props;
      component.simulate("click", event);
      await component.simulate("keydown", { keyCode: 13 });
      expect(props.selectItem).toHaveBeenCalledWith(item);
      expect(setExpanded).not.toHaveBeenCalled();
    });

    it("should focus on and expand directory on click", async () => {
      const setExpanded = jest.fn();
      const selectItem = jest.fn();

      const { component, instance, props } = render({
        item: createMockDirectory(),
        source: null,
        depth: 1,
        focused: true,
        expanded: false,
        setExpanded,
        selectItem
      });

      const { item } = instance.props;
      component.simulate("click", { event: "click" });
      expect(setExpanded).toHaveBeenCalledWith(item, false, undefined);
      expect(props.selectItem).not.toHaveBeenCalled();
    });
  });
});

function generateDefaults(overrides) {
  const source = createMockSource(
    "server1.conn13.child1/39",
    "http://mdn.com/one.js"
  );
  const item = {
    name: "one.js",
    path: "mdn.com/one.js",
    contents: source
  };

  return {
    expanded: false,
    item,
    source,
    debuggeeUrl: "http://mdn.com",
    projectRoot: "",
    clearProjectDirectoryRoot: jest.fn(),
    setProjectDirectoryRoot: jest.fn(),
    setExpanded: jest.fn(),
    selectItem: jest.fn(),
    focusItem: jest.fn(),
    ...overrides
  };
}

function render(overrides = {}) {
  const props = generateDefaults(overrides);
  const component = shallow(<SourcesTreeItem {...props} />);
  const defaultState = component.state();
  const instance = component.instance();

  // instance.shouldComponentUpdate = () => true;

  return { component, props, defaultState, instance };
}

function createMockSource(id, url, isBlackBoxed = false, sourceMapURL = null) {
  return createSource({
    id: id,
    url: url,
    isPrettyPrinted: false,
    isWasm: false,
    sourceMapURL,
    isBlackBoxed: isBlackBoxed,
    loadedState: "unloaded"
  });
}

function createMockDirectory(path = "folder/", name = "folder", contents = []) {
  return {
    type: "directory",
    name,
    path,
    contents
  };
}

function createMockItem(
  path = "http://mdn.com/one.js",
  name = "one.js",
  contents = { id: "server1.conn13.child1/39" }
) {
  return {
    type: "source",
    name,
    path,
    contents
  };
}
