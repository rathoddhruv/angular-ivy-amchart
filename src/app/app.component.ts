import {
  ValueAxis,
  CircleBullet,
  XYCursor,
  XYChart,
  LineSeries,
  DateAxis
} from '@amcharts/amcharts4/charts';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import { color, create, useTheme } from '@amcharts/amcharts4/core';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import {
  Component,
  OnInit,
  NgZone,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewChild,
  HostListener,
  ViewEncapsulation,
  ElementRef
} from '@angular/core';
import { MouseCursorStyle } from '@amcharts/amcharts4/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import {
  startOfDay,
  endOfDay,
  addHours,
  addDays,
  addYears,
  startOfYear,
  endOfYear,
  isBefore,
  addMonths
} from 'date-fns';
// import { data } from './intervalData/denver';
// import { data } from './intervalData/chicago-hour';
import { data } from './intervalData/compare';
useTheme(am4themes_animated);
@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private zone: NgZone,
    private formBuilder: FormBuilder
  ) {}

  chart: am4charts.XYChart = new am4charts.XYChart();
  @ViewChild('chartDiv1', { static: false }) chartDiv1: ElementRef;
  start = new Date();
  end = new Date();

  ngOnInit() {
    let chart = am4core.create('chartdiv_1', am4charts.XYChart);
    let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    let consumptionAxis = chart.yAxes.push(new am4charts.ValueAxis());
    let demandAxis = chart.yAxes.push(new am4charts.ValueAxis());
    demandAxis.renderer.opposite = true;
    let weatherAxis = chart.yAxes.push(new am4charts.ValueAxis());

    let consumptionSeries = chart.series.push(new am4charts.ColumnSeries());
    let demandSeries = chart.series.push(new am4charts.LineSeries());
    let weatherSeries = chart.series.push(new am4charts.LineSeries());

    let consumptionSeries2 = chart.series.push(new am4charts.ColumnSeries());
    let demandSeries2 = chart.series.push(new am4charts.LineSeries());
    let weatherSeries2 = chart.series.push(new am4charts.LineSeries());

    consumptionSeries.zIndex = 10;
    consumptionSeries2.zIndex = 10;
    demandSeries.zIndex = 20;
    demandSeries2.zIndex = 20;
    weatherSeries.zIndex = 20;
    weatherSeries2.zIndex = 20;

    dateAxis.min = addYears(startOfYear(new Date()), -2).getTime();
    dateAxis.max = endOfYear(endOfYear(new Date())).getTime();

    this.zone.runOutsideAngular(() => {
      // Add legend
      chart.legend = new am4charts.Legend();
      chart.legend.position = 'absolute';
      chart.legend.parent = chart.bottomAxesContainer;
      chart.scrollbarX = new am4charts.XYChartScrollbar();
      chart.scrollbarX.parent = chart.bottomAxesContainer;

      // chart.dateFormatter.utc = true;
      // chart.maskBullets = false;
      chart.dateFormatter.inputDateFormat = 'i';
      chart.dateFormatter.timezone = 'America/Chicago';
      chart.cursor = new XYCursor();
      chart.cursor.behavior = 'panX';

      chart.cursor.behavior = 'selectXY';
      // let consumptionState = consumptionSeries.columns.template.states.create(
      //   "hover"
      // );
      chart.scrollbarX.series.push(consumptionAxis);

      dateAxis.id = 'dateAxis';
      dateAxis.renderer.grid.template.location = 0;
      // dateAxis.renderer.grid.template.location = 0.5;
      dateAxis.renderer.labels.template.location = 0.00001;
      dateAxis.renderer.minGridDistance = 100;
      dateAxis.renderer.cellStartLocation = 0.2;
      dateAxis.renderer.cellEndLocation = 0.8;

      dateAxis.tooltipDateFormat = 'hh:mm a, d MMMM yyyy';
      dateAxis.tooltipText = '{HH:mm:ss}';
      dateAxis.renderer.grid.template.disabled = true;
      dateAxis.renderer.fullWidthTooltip = true;

      dateAxis.baseInterval = { timeUnit: 'hour', count: 1 };

      consumptionAxis.title.text = 'consumption';
      consumptionAxis.title.fill = am4core.color('#0A7696');
      consumptionAxis.renderer.labels.template.fill = am4core.color('#0A7696');
      consumptionAxis.strictMinMax = false;
      // consumptionAxis.min = 0;
      consumptionAxis.renderer.grid.template.disabled = true;
      consumptionAxis.renderer.opposite = false;
      consumptionAxis.renderer.labels.template.fontWeight = 'bold';

      demandAxis.title.text = 'demand';
      demandAxis.title.fill = am4core.color('#E14555');
      demandAxis.renderer.labels.template.fill = am4core.color('#E14555');
      demandAxis.renderer.grid.template.disabled = true;
      demandAxis.renderer.opposite = true;
      demandAxis.background.fill = am4core.color('#fff');
      demandAxis.renderer.labels.template.fontWeight = 'bold';

      weatherAxis.title.text = '[bold]Temperature (F)';
      weatherAxis.title.fill = am4core.color('#70728A');
      weatherAxis.renderer.labels.template.fill = am4core.color('#70728A');
      weatherAxis.background.fill = am4core.color('#fff');
      weatherAxis.renderer.grid.template.disabled = true;
      weatherAxis.renderer.opposite = true;
      weatherAxis.strictMinMax = false;
      weatherAxis.min = 0;
      weatherAxis.title.rotation = 270;
      weatherAxis.renderer.labels.template.fontWeight = 'bold';

      demandAxis.strictMinMax = false;
      demandAxis.min = 0;
      demandAxis.title.rotation = 270;
      let consumptionState = consumptionSeries.columns.template.states.create(
        'hover'
      );
      demandSeries.bullets.push(new am4charts.CircleBullet());
      let demandBullet2 = demandSeries2.bullets.push(
        new am4charts.CircleBullet()
      );
      let weatherBullet = weatherSeries.bullets.push(
        new am4charts.CircleBullet()
      );
      let weatherBullet2 = weatherSeries2.bullets.push(
        new am4charts.CircleBullet()
      );

      // Create series
      consumptionSeries.columns.template.cursorOverStyle =
        MouseCursorStyle.pointer;
      consumptionSeries.sequencedInterpolation = false;
      consumptionSeries.dataFields.valueY = 'value';
      consumptionSeries.dataFields.dateX = 'time';
      consumptionSeries.yAxis = consumptionAxis;
      consumptionSeries.columns.template.propertyFields.strokeDasharray =
        'dashLength';
      consumptionSeries.groupFields.valueY = 'sum';
      consumptionSeries.name = 'Consumption';
      consumptionSeries.columns.template.fillOpacity = 1;
      consumptionSeries.columns.template.fill = am4core.color('#0C7696');
      consumptionSeries.stroke = am4core.color('#0C7696');
      consumptionSeries.tooltip.background.stroke = am4core.color('#0C7696');
      consumptionSeries.tooltip.label.fontWeight = 'bold';
      consumptionSeries.tooltip.background.fill = am4core.color('#ffffff');
      consumptionSeries.tooltip.label.fill = am4core.color('#000000');
      consumptionSeries.id = 'consumption';
      consumptionSeries.tooltip.background.strokeWidth = 0;
      consumptionSeries.tooltip.getFillFromObject = false;
      consumptionSeries.columns.template.tooltipText =
        "{valueY.formatNumber('#,###.')} " + +'';
      consumptionSeries.columns.template.width = am4core.percent(100);
      consumptionSeries.clustered = false;
      consumptionSeries.hiddenInLegend = true;
      consumptionSeries.hidden = true;
      consumptionSeries.hide();
      consumptionSeries.hide(0);

      consumptionSeries2.columns.template.cursorOverStyle =
        MouseCursorStyle.pointer;
      consumptionSeries2.sequencedInterpolation = false;
      consumptionSeries2.dataFields.valueY = 'value2';
      consumptionSeries2.dataFields.dateX = 'time';
      consumptionSeries2.yAxis = consumptionAxis;
      consumptionSeries2.columns.template.propertyFields.strokeDasharray =
        'dashLength';
      consumptionSeries2.groupFields.valueY = 'sum';
      consumptionSeries2.name = 'consumption1';
      consumptionSeries2.columns.template.fillOpacity = 1;
      consumptionSeries2.columns.template.fill = am4core.color('#59C2EC');
      consumptionSeries2.stroke = am4core.color('#59C2EC');
      consumptionSeries2.tooltip.background.stroke = am4core.color('#59C2EC');
      consumptionSeries2.tooltip.label.fontWeight = 'bold';
      consumptionSeries2.tooltip.background.fill = am4core.color('#ffffff');
      consumptionSeries2.tooltip.label.fill = am4core.color('#000000');
      consumptionSeries2.id = 'consumption1';
      consumptionSeries2.tooltip.background.strokeWidth = 0;
      consumptionSeries2.tooltip.getFillFromObject = false;
      consumptionSeries2.columns.template.tooltipText =
        "{valueY.formatNumber('#,###.')} " + +'';
      consumptionSeries2.columns.template.width = am4core.percent(100);
      consumptionState.properties.fillOpacity = 0.9;
      consumptionSeries2.hiddenInLegend = true;
      consumptionSeries2.clustered = false;
      consumptionSeries2.hide();

      demandSeries.sequencedInterpolation = true;
      demandSeries.dataFields.valueY = 'demand';
      demandSeries.dataFields.dateX = 'time';
      demandSeries.yAxis = demandAxis;
      demandSeries.name = 'Demand';
      demandSeries.stroke = am4core.color('red');
      demandSeries.propertyFields.strokeDasharray = 'dashLength';
      demandSeries.strokeWidth = 2;
      demandSeries.stroke = am4core.color('#E03445');

      demandSeries.tooltip.background.stroke = am4core.color('#E03445');
      demandSeries.tooltip.label.fontWeight = 'bold';
      demandSeries.connect = false;
      demandSeries.tooltip.background.fill = am4core.color('#ffffff');
      demandSeries.tooltip.label.fill = am4core.color('#000000');
      demandSeries.id = 'demand';
      demandSeries.tooltip.background.strokeWidth = 2;
      demandSeries.tooltip.getFillFromObject = false;
      demandSeries.tooltipText = "{valueY.formatNumber('#,###.')} " + +'';
      demandSeries.groupFields.valueY = 'high';
      demandSeries.tensionX = 0.77;

      demandSeries2.sequencedInterpolation = true;
      demandSeries2.dataFields.valueY = 'demand1';
      demandSeries2.dataFields.dateX = 'time';
      demandSeries2.yAxis = demandAxis;
      demandSeries2.name = 'demand1';
      demandSeries2.stroke = am4core.color('red');
      demandSeries2.propertyFields.strokeDasharray = 'dashLength';
      demandSeries2.strokeWidth = 2;
      demandSeries2.stroke = am4core.color('#D90368');
      demandSeries2.tooltip.background.stroke = am4core.color('#D90368');
      demandSeries2.tooltip.label.fontWeight = 'bold';
      demandSeries2.connect = false;
      demandSeries2.tooltip.background.fill = am4core.color('#ffffff');
      demandSeries2.tooltip.label.fill = am4core.color('#000000');
      demandSeries2.id = 'demand1';
      demandSeries2.tooltip.background.strokeWidth = 2;
      demandSeries2.tooltip.getFillFromObject = false;
      demandSeries2.tooltipText = "{valueY.formatNumber('#,###.')} " + +'';
      demandSeries2.tensionX = 0.77;
      demandSeries2.strokeDasharray = '8,4';
      demandSeries2.hiddenInLegend = true;
      demandSeries2.hide();
      // demandSeries2.hiddenInLegend = true;

      //////////////////////////////////////////////
      demandBullet2.fill = am4core.color('red');

      // let weatherBullet: am4charts.CircleBullet;
      // weatherSeries = chart.series.values[2] as am4charts.LineSeries;
      weatherBullet = weatherSeries.bullets.values[0] as am4charts.CircleBullet;
      weatherBullet.fill = am4core.color('#FFB822');
      //////////////////////////////////////////////
      weatherSeries.sequencedInterpolation = true;
      weatherSeries.dataFields.valueY = 'temperature';
      weatherSeries.dataFields.dateX = 'time';
      weatherSeries.yAxis = chart.yAxes.values[2] as am4charts.ValueAxis;
      weatherSeries.name = 'Avg Temp';
      weatherSeries.strokeWidth = 2;
      weatherSeries.id = 'weather1';
      weatherSeries.tooltip.label.fontWeight = 'bold';
      weatherSeries.stroke = am4core.color('#ffbb28');
      weatherSeries.propertyFields.strokeDasharray = 'dashLength';
      weatherSeries.tooltip.background.stroke = am4core.color('#ffbb28');
      weatherSeries.tooltip.background.fill = am4core.color('#ffffff');
      weatherSeries.tooltip.label.fill = am4core.color('#000000');
      weatherSeries.tooltip.background.strokeWidth = 2;
      weatherSeries.tooltip.getFillFromObject = false;
      weatherSeries.tooltipText =
        "{valueY.formatNumber('#,###.')}" + '° F' + '';
      weatherSeries.groupFields.valueY = 'average';

      // weatherSeries2 = chart.series.values[2] as am4charts.LineSeries;
      weatherBullet2 = weatherSeries2.bullets
        .values[0] as am4charts.CircleBullet;
      weatherBullet2.fill = am4core.color('#FFB822');
      //////////////////////////////////////////////
      weatherSeries2.sequencedInterpolation = true;
      weatherSeries2.dataFields.valueY = 'temperature2';
      weatherSeries2.dataFields.dateX = 'time';
      weatherSeries2.yAxis = chart.yAxes.values[2] as am4charts.ValueAxis;
      weatherSeries2.name = 'Avg Temp2';
      weatherSeries2.strokeWidth = 2;
      weatherSeries2.id = 'weather2';
      weatherSeries2.tooltip.label.fontWeight = 'bold';
      weatherSeries2.stroke = am4core.color('#ffbb28');
      weatherSeries2.propertyFields.strokeDasharray = 'dashLength';
      weatherSeries2.tooltip.background.stroke = am4core.color('#ffbb28');
      weatherSeries2.tooltip.background.fill = am4core.color('#ffffff');
      weatherSeries2.tooltip.label.fill = am4core.color('#000000');
      weatherSeries2.tooltip.background.strokeWidth = 2;
      weatherSeries2.tooltip.getFillFromObject = false;
      weatherSeries2.tooltipText =
        "{valueY.formatNumber('#,###.')}" + '° F' + '';
      weatherSeries2.groupFields.valueY = 'average';

      am4core.getInteraction().body.events.on('keydown', ev => {
        console.log('keyboard keydown');
        // consumptionSeries.columns.template.cursorOverStyle = MouseCursorStyle.default;
        // chart.cursorOverStyle = am4core.MouseCursorStyle.default;

        if (am4core.keyboard.isKey(ev.event, 'shift')) {
          chart.cursor.behavior = 'zoomX';
          // chart.cursor.behavior ="selectX";
          return;
        }
        if (am4core.keyboard.isKey(ev.event, 'ctrl')) {
          // consumptionState.dispose();
          // consumptionState = consumptionSeries.columns.template.states.create(
          //   "hidden"
          // );
          consumptionSeries.columns.template.cursorOverStyle =
            MouseCursorStyle.default;

          this.chartDiv1.nativeElement.style = `cursor: url("data:image/svg+xml,%3Csvg width='23px' height='23px' viewBox='0 0 23 23' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3Eato/graph cursor - ctrl%3C/title%3E%3Cg id='ato/graph-cursor---ctrl' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3E%3Cpath d='M12,-2.72848411e-12 L12.0003924,4.51760973 C15.4675652,4.76249954 18.2375005,7.53243478 18.4823903,10.9996076 L23,11 L23,12 L18.4824612,11.9993867 C18.2380361,15.4670295 15.4679005,18.2374768 12.0003924,18.4823903 L12,23 L11,23 L11.0006133,18.4824612 C7.5326352,18.2380125 4.76198751,15.4673648 4.51753877,11.9993867 L0,12 L0,11 L4.51760973,10.9996076 C4.76252322,7.53209953 7.53297047,4.76196388 11.0006133,4.51753877 L11,-2.72848411e-12 L12,-2.72848411e-12 Z M12.0009037,5.52061151 L12,8.5 L11,8.5 L11.0000973,5.52052886 C8.08545439,5.76093454 5.76149415,8.08458865 5.52061151,10.9990963 L8.5,10.999 L8.5,11.999 L5.52052886,11.9999027 C5.76096206,14.9148793 8.08512071,17.2390379 11.0000973,17.4794711 L11,14.5 L12,14.5 L12.0009037,17.4793885 C14.9154113,17.2385058 17.2390655,14.9145456 17.4794711,11.9999027 L14.5,11.999 L14.5,10.999 L17.4793885,10.9990963 C17.2385334,8.08492231 14.9150777,5.76146658 12.0009037,5.52061151 Z' id='Combined-Shape' fill='%23000000' fill-rule='nonzero'%3E%3C/path%3E%3C/g%3E%3C/svg%3E") 12 12, pointer !important;`;
          chart.cursor.behavior = 'selectXY';
          // chart.cursor.behavior ="selectX";
          // this.chartDiv1.nativeElement.style = 'height: 500px';
          return;
        }

        chart.cursor.behavior = 'panX';
      });

      am4core.getInteraction().body.events.on('keyup', ev => {
        console.log('keyboard keyup key press');
        if (am4core.keyboard.isKey(ev.event, 'shift')) {
          chart.cursor.behavior = 'panX';
        }
        if (am4core.keyboard.isKey(ev.event, 'ctrl')) {
          // consumptionSeries.columns.template.cursorOverStyle = MouseCursorStyle.pointer;
          this.chartDiv1.nativeElement.style.cursor = 'default';
          chart.cursor.behavior = 'panX';
        }
        // chart.cursorOverStyle = am4core.MouseCursorStyle.default;
      });

      am4core.getInteraction().body.events.on('DOWN', ev => {
        console.log('keyboard key DOWN');
        this.chartDiv1.nativeElement.style = `cursor: url("data:image/svg+xml,%3Csvg width='13px' height='13px' viewBox='0 0 13 13' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3Eato/graph cursor%3C/title%3E%3Cg id='ato/graph-cursor' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3E%3Cpath d='M7,-5.24025268e-14 L7,5.999 L13,6 L13,7 L7,6.999 L7,13 L6,13 L6,6.999 L0,7 L0,6 L6,5.999 L6,-5.24025268e-14 L7,-5.24025268e-14 Z' id='Combined-Shape' fill='%23000000' fill-rule='nonzero'%3E%3C/path%3E%3C/g%3E%3C/svg%3E"), pointer !important`;

        chart.cursorOverStyle = am4core.MouseCursorStyle.default;
      });

      let data = this.generateChartData(
        addYears(new Date(), -3),
        new Date(),
        0,
        true
      );
      chart.map.getKey('demand').data = data;
      chart.map.getKey('consumption').data = data;
      // chart.map.getKey("weather1").data = data[0];

      // this.chart.data = this.generateChartData(0);
      // setTimeout(() => {
      //   chart.map.getKey("consumption1").data = data[1];
      //   chart.map.getKey("demand1").data = data[1];
      //   chart.map.getKey("weather2").data = data[1];
      // }, 2000);
      //(this.chart.xAxes.getIndex(0) as am4charts.DateAxis).zoomToDates(
      //   startOfDay(new Date()),
      //   endOfDay(addDays(new Date(), 12)),
      //   true,
      //   true
      // );
      consumptionSeries.columns.template.events.on('hit', ev => {
        console.log(ev.target.dataItem);

        // item.controls['fromDate'].setValue(ev.target.dataItem.dates.dateX, { emitEvent: false });
        // //interval will be range
        // item.controls['range'].setValue(optionRange[this.findIndexFromOptions(item.controls['interval'].value.value, item.controls['interval'].value.label, optionRange)], { emitEvent: false });
        // this.setDateByRange(item, null, item.controls['fromDate'].value);
        // this.setIntervalOptions(item);
        // this.checkDateExceedLimit(item, true);

        chart.cursor.behavior = 'panX';
      });

      // chart.events.on("ready", () => {
      //   (this.chart.xAxes.getIndex(0) as am4charts.DateAxis).zoomToDates(
      // startOfDay(new Date()) ,
      // endOfDay(new Date()),
      // true,
      // true
      // );
      // })
      // this.chart.events.on("datavalidated", (ev) => {
      //       // Create a range
      //       console.log('datavalidated () => zoomToDates selected');
      //       setTimeout(() => {
      //        (this.chart.xAxes.getIndex(0) as am4charts.DateAxis).zoomToDates(
      //         startOfDay(new Date()) ,
      //         endOfDay(new Date()),
      //         true,
      //         true
      //         );

      //       }, 50);

      //     });
      chart.events.on('ready', () => {
        (chart.xAxes.getIndex(0) as am4charts.DateAxis).zoomToDates(
          new Date('2021-07-01'),
          new Date('2021-07-07'),
          true,
          true,
          true
        );
      });

      this.chart = chart;
      this.chart.map.getKey('consumption').hide(0);
      this.chart.map.getKey('demand').show();
      this.chart.map.getKey('demand').fillOpacity = 0.5;
      this.chart.map.getKey('demand').fill = am4core.color('#fc4e60');
      this.chart.map.getKey('demand').bulletsContainer.hide();
      this.chart.map.getKey('demand').cursorTooltipEnabled = true;

      (this.chart.map.getKey(
        'consumptionAxis'
      ) as am4charts.ValueAxis).cursorTooltipEnabled = true;
    });
  }

  generateChartData(start: Date, end: Date, interval, isWeather) {
    var chartData = [[], []];
    var value = 1600;
    var demand = 1600;
    var temperature = 1600;

    let step = 0;
    var newDate = start;
    while (isBefore(newDate, end)) {
      if (interval == 3600) {
        newDate = addHours(newDate, 1);
      } else {
        newDate = addMonths(newDate, 1);
      }

      if (step >= 60) {
        step = 0;
      } else {
        step = step + 5;
      }

      value += Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 100);
      demand += Math.round(
        (Math.random() < 0.5 ? 1 : -1) * Math.random() * 100
      );
      temperature += Math.round(
        (Math.random() < 0.5 ? 1 : -1) * Math.random() * 100
      );

      chartData[0].push({
        time: newDate.toUTCString(),
        value: value,
        demand: demand,
        temperature: temperature
      });
    }

    if (interval == 3600) {
    } else {
    }
    debugger;
    // return chartData;
    return data;
  }

  // zoomChange(start, end) {
  //   (this.chart.xAxes.getIndex(0) as am4charts.DateAxis).zoomToDates(
  //     start,
  //     end,
  //     true,
  //     true
  //   );
  // }

  recentRange(value: number) {
    // let data: any;
    // if (value === 7) {
    //   (this.chart.map.getKey("dateAxis") as am4charts.DateAxis).baseInterval = {
    //     timeUnit: "hour",
    //     count: 1
    //   };
    //   data = this.generateChartData(
    //     addDays(new Date(), -7),
    //     new Date(),
    //     3600,
    //     true
    //   );
    //   (this.chart.map.getKey("dateAxis") as am4charts.DateAxis).zoomToDates(
    //     addDays(new Date(), -7),
    //     new Date(),
    //     true,
    //     true,
    //     true
    //   );
    // } else if (value === 365) {
    //   (this.chart.map.getKey("dateAxis") as am4charts.DateAxis).baseInterval = {
    //     timeUnit: "month",
    //     count: 1
    //   };
    //   data = this.generateChartData(
    //     addYears(new Date(), -3),
    //     new Date(),
    //     0,
    //     true
    //   );
    //   (this.chart.map.getKey("dateAxis") as am4charts.DateAxis).zoomToDates(
    //     addYears(new Date(), -3),
    //     new Date(),
    //     true,
    //     true,
    //     true
    //   );
    // }
    // this.chart.map.getKey("demand").data = data[0];
    // this.chart.map.getKey("consumption").data = data[0];
    // this.chart.map.getKey("weather1").data = data[0];
  }

  ngOnDestroy() {
    this.zone.runOutsideAngular(() => {
      console.log('graph disposed');
      if (this.chart) {
        this.chart.dispose();
      }
    });
  }
}
