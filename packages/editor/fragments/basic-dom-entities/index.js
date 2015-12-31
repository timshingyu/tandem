import {
  Fragment,
  UnitFragment,
  EntityFragment,
  ComponentFragment,
  KeyCommandFragment,
  ApplicationFragment,
  EntityPaneComponentFragment,
  EntityLayerLabelComponentFragment
} from 'editor/fragment/types';

import inflection from 'inflection';

import FontInputComponent from './components/style-inputs/font';
import TextInputComponent from 'common/components/inputs/text';
import UnitInputComponent from 'common/components/inputs/unit';
import ColorPickerComponent from 'common/components/inputs/color-picker';
import TextAlignInputComponent from './components/style-inputs/text-align';
import BackgroundInputComponent from './components/style-inputs/background';

import StylePaneComponent from './components/entity-panes/styles';
import HTMLEntityComponent from './components/preview';
import { CallbackNotifier } from 'common/notifiers';
import TransformPaneComponent from './components/entity-panes/transform';

import TypographyPaneComponent from './components/entity-panes/typography';
import AppearancePaneComponent from './components/entity-panes/appearance';
import TextLayerLabelComponent from './components/entity-layer-labels/text';
import { TextEntity, ElementEntity, RootEntity } from './entities';
import { SetFocusMessage } from 'editor/message-types';

export default ApplicationFragment.create({
  id: 'basicDOMEntities',
  factory: {
    create({ app }) {
      registerEntities(app);
      registerCommands(app);
      registerStyleInputs(app);
      registerUnits(app);
    }
  }
});

function registerEntities(app) {
  app.fragments.push(

    EntityFragment.create({
      id      : 'rootEntity',
      factory : RootEntity
    }),

    // text
    EntityFragment.create({
      id      : 'textEntity',
      factory : TextEntity
    }),
    EntityLayerLabelComponentFragment.create({
      id             : 'textPaneLayerComponent',
      layerType      : 'text',
      entityType     : 'component',
      componentClass : TextLayerLabelComponent
    }),

    // element
    EntityFragment.create({
      id      : 'elementEntity',
      factory : ElementEntity
    })
  );
}

function createComponentStyleFragment(name, type, componentClass) {
  return ComponentFragment.create({
    id             : name + 'StyleInputComponent',
    componentType  : 'styleInput',
    componentClass : componentClass,
    styleName      : name,
    styleType      : type
  })
}

function registerUnits(app) {
  ['px', 'pt', 'cm', 'mm', '%', 'em'].forEach(function(unit) {
    app.fragments.push(
      UnitFragment.create(unit)
    );
  })
}

function registerStyleInputs(app) {

  var styleName;

  var inf = {
    layout: [
      [ 'display'  , TextInputComponent ],
      [ 'position' , TextInputComponent ],

      // drop menu of options ere
      [ 'float'        , TextInputComponent ],

      [ 'margin'       , UnitInputComponent ],
      [ 'marginLeft'   , UnitInputComponent ],
      [ 'marginTop'    , UnitInputComponent ],
      [ 'marginRight'  , UnitInputComponent ],
      [ 'marginBottom' , UnitInputComponent ],

      [ 'padding'       , UnitInputComponent ],
      [ 'paddingLeft'   , UnitInputComponent ],
      [ 'paddingTop'    , UnitInputComponent ],
      [ 'paddingRight'  , UnitInputComponent ],
      [ 'paddingBottom' , UnitInputComponent ]
    ],
    transform: [

      // need to display warning if position is static
      [ 'left'   , UnitInputComponent ],
      [ 'top'    , UnitInputComponent ],
      [ 'width'  , UnitInputComponent ],
      [ 'height' , UnitInputComponent ],

      // css3
      [ 'transform', TextInputComponent ]
    ],
    typography: [
      [ 'fontFamily'     , FontInputComponent      ],
      [ 'fontSize'       , UnitInputComponent      ],

      // http://www.w3schools.com/cssref/pr_font_font-style.asp
      [ 'fontStyle'      , TextInputComponent      ],
      [ 'fontWeight'     , TextInputComponent      ],

      // http://www.w3schools.com/cssref/pr_text_text-decoration.asp
      [ 'textDecoration' , TextInputComponent      ],
      [ 'textAlign'      , TextAlignInputComponent ],
      [ 'wordWrap'       , TextInputComponent      ],

      // drop menu here
      [ 'textOverflow'  , TextInputComponent   ],
      [ 'color'      , ColorPickerComponent    ]
    ],
    appearance: [

      // https://developer.mozilla.org/en-US/docs/Web/CSS/background
      [ 'background'   , BackgroundInputComponent ],
      [ 'borderRadius' , UnitInputComponent       ],

      // TODO - box shadow component here
      [ 'boxShadow'    , TextInputComponent       ],

      // TODO - slider component from 0 - 100
      [ 'opacity'      , UnitInputComponent       ],

      [ 'border'       , TextInputComponent       ],
      [ 'borderLeft'   , TextInputComponent       ],
      [ 'borderTop'    , TextInputComponent       ],
      [ 'borderRight'  , TextInputComponent       ],
      [ 'borderBottom' , TextInputComponent       ],

      // https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode
      [ 'mixBlendMode' , TextInputComponent       ]
    ]
  }

  for (var type in inf) {

    for (var [styleName, componentClass] of inf[type]) {
      app.fragments.push(createComponentStyleFragment(styleName, type, componentClass));
    }

    app.fragments.push(
      EntityPaneComponentFragment.create({
        id             : type + 'PaneComponent',

        // TODO - use uppercase lib
        label          : inflection.titleize(type),
        styleType      : type,
        paneType       : 'entity',
        entityType     : 'component',
        componentClass : StylePaneComponent
      }),
    )
  }

  // default style input
  app.fragments.push(
    ComponentFragment.create({
      id             : 'styleInputCoponent',
      componentType  : 'styleInput',
      componentClass : TextInputComponent
    })
  );
}

function registerCommands(app) {
  app.fragments.push(

    // generic
    // TODO - move this to its own fragment
    KeyCommandFragment.create({
      id         : 'boldCommand',
      keyCommand : 'backspace',
      notifier   : CallbackNotifier.create(function() {
        if (!app.focus || !app.focus.componentType || !app.focus.parent) return;

        // FIXME: leaky here. should be able to remove entity
        // without it being unfocused
        var focus = app.focus;
        var focusIndex = focus.parent.children.indexOf(focus);

        app.notifier.notify(SetFocusMessage.create(focusIndex ? focus.parent.children[focusIndex - 1] : focus.parent.children[focusIndex + 1]));

        // remove the child deleted
        focus.parent.children.remove(focus);
      })
    }),


    // text
    KeyCommandFragment.create({
      id         : 'boldCommand',
      keyCommand : 'command+b',
      notifier   : createStyleToggler(app, 'fontWeight', 'bold', 'normal')
    }),
    KeyCommandFragment.create({
      id         : 'italicCommand',
      keyCommand : 'command+i',
      notifier   : createStyleToggler(app, 'fontStyle', 'italic', 'normal')
    }),
    KeyCommandFragment.create({
      id         : 'underlineCommand',
      keyCommand : 'command+u',
      notifier   : createStyleToggler(app, 'textDecoration', 'underline', 'none')
    })
  );

  registerComponents(app);
}

function createStyleToggler(app, name, onValue, offValue) {
  return CallbackNotifier.create(function(message) {
    if (!app.focus || app.focus.componentType !== 'text') return;
    app.focus.setStyle({
      [name]: app.focus.getStyle()[name] === onValue ? offValue : onValue
    });
  })
}


// TODO - move this to basic-dom-entities
function registerComponents(app) {

  [
    'ul',
    'li',
    'div',
    'button',
    'br',
    'center',
    'footer',
    'code',
    'col',
    'iframe',
    'html',
    'body',
    'head',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'a',
    'input',
    'title',
    'strong',
    'style',
    'p',
    'ol',
    'link',
    'i',
    'b',
    'text'
  ].forEach(function(elementName) {
    app.fragments.push(ComponentFragment.create({
      id: elementName + 'Element',
      componentType: elementName,
      componentClass: HTMLEntityComponent
    }));
  });
}