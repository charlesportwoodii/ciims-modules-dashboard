<?php $this->renderPartial('settings', array('model' => $model)); ?>
<?php echo CHtml::link(Yii::t('Dashboard.main', 'Test Email Settings'), '#', array('id'=>'testEmailSettings', 'class' => 'pure-button pure-button-warning pure-button-xsmall')); ?>
<?php Yii::app()->clientScript->registerScript('testEmailSettings', 'Settings.testEmailSettings();'); ?>